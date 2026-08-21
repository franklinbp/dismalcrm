import { Op } from "sequelize";

import Contact from "../../models/Contact";
import CommercialLead from "../../models/CommercialLead";
import Company from "../../models/Company";
import Ticket from "../../models/Ticket";

export interface SyncCommercialLeadsSummary {
  scannedTickets: number;
  createdLeads: number;
  existingLeads: number;
  skippedTickets: number;
}

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

const SyncCommercialLeadsFromTicketsService =
  async (): Promise<SyncCommercialLeadsSummary> => {
  const tickets = await Ticket.findAll({
    where: {
      contactId: { [Op.not]: null },
      isGroup: false
    },
    include: [{ model: Contact, as: "contact" }],
    limit: 200,
    order: [["updatedAt", "DESC"]]
  });

  const summary: SyncCommercialLeadsSummary = {
    scannedTickets: tickets.length,
    createdLeads: 0,
    existingLeads: 0,
    skippedTickets: 0
  };

  const defaultCompany = await Company.findOne({ order: [["id", "ASC"]] });

  for (const ticket of tickets) {
    const contactId = ticket.contactId || ticket.contact?.id;
    const companyId =
      ticket.companyId || ticket.contact?.companyId || defaultCompany?.id;

    if (!contactId || !companyId) {
      summary.skippedTickets += 1;
      continue;
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

    if (created) {
      summary.createdLeads += 1;
    } else {
      await lead.update({
        origin:
          detectedOrigin === "Meta Ads" && lead.origin !== "Meta Ads"
            ? detectedOrigin
            : lead.origin,
        lastContactAt: ticket.updatedAt,
        interest: lead.interest || buildInterest(ticket.lastMessage)
      });
      summary.existingLeads += 1;
    }
  }

  return summary;
};

export default SyncCommercialLeadsFromTicketsService;
