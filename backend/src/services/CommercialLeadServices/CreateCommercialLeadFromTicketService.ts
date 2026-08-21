import AppError from "../../errors/AppError";
import CommercialLead from "../../models/CommercialLead";
import Company from "../../models/Company";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

const originByChannel = (channel?: string, message?: string): string => {
  const text = `${message || ""}`.toLowerCase();
  if (
    text.includes("facebook") ||
    text.includes("meta") ||
    text.includes("solicitud en fa")
  ) {
    return "Meta Ads";
  }
  if (channel === "facebook") return "Messenger";
  if (channel === "instagram") return "Instagram";
  return "WhatsApp";
};

const buildInterest = (message?: string): string => {
  if (!message) return "";
  return message.length > 4000 ? `${message.slice(0, 4000)}...` : message;
};

const CreateCommercialLeadFromTicketService = async (
  ticketId: string | number
): Promise<{ lead: CommercialLead; created: boolean }> => {
  const ticket = await Ticket.findByPk(ticketId, {
    include: [{ model: Contact, as: "contact" }]
  });

  if (!ticket) {
    throw new AppError("Ticket no encontrado", 404);
  }

  const contactId = ticket.contactId || ticket.contact?.id;
  let companyId = ticket.companyId || ticket.contact?.companyId;

  if (!companyId) {
    const defaultCompany = await Company.findOne({ order: [["id", "ASC"]] });
    companyId = defaultCompany?.id;
  }

  if (!contactId || !companyId) {
    throw new AppError("El ticket no tiene cliente valido para comercial", 400);
  }

  if (ticket.isGroup) {
    throw new AppError("No se puede enviar un grupo a comercial", 400);
  }

  if (ticket.contact && !ticket.contact.companyId) {
    await ticket.contact.update({ companyId });
  }

  const detectedOrigin = originByChannel(ticket.channel, ticket.lastMessage);
  const [lead, created] = await CommercialLead.findOrCreate({
    where: { ticketId: ticket.id },
    defaults: {
      ticketId: ticket.id,
      contactId,
      companyId,
      channel: ticket.channel || "whatsapp",
      origin: detectedOrigin,
      status: "NEW",
      customerType: "UNKNOWN",
      interest: buildInterest(ticket.lastMessage),
      lastContactAt: ticket.updatedAt
    }
  });

  if (!created) {
    await lead.update({
      lastContactAt: ticket.updatedAt,
      interest: lead.interest || buildInterest(ticket.lastMessage),
      origin:
        detectedOrigin === "Meta Ads" && lead.origin !== "Meta Ads"
          ? detectedOrigin
          : lead.origin
    });
  }

  await lead.reload({ include: ["contact", "ticket", "tasks"] });

  return { lead, created };
};

export default CreateCommercialLeadFromTicketService;
