import { subHours } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import ShowTicketService from "./ShowTicketService";

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  groupContact?: Contact,
  companyId?: number
): Promise<Ticket> => {
  const scopedCompanyId =
    companyId || contact.companyId || groupContact?.companyId;

  if (!scopedCompanyId) {
    throw new AppError("ERR_WAPP_COMPANY_REQUIRED", 409);
  }

  const companyWhere = { companyId: scopedCompanyId };

  let ticket = await Ticket.findOne({
    where: {
      ...companyWhere,
      status: {
        [Op.or]: ["open", "pending"]
      },
      contactId: groupContact ? groupContact.id : contact.id,
      whatsappId: whatsappId
    } as any
  });

  if (ticket) {
    await ticket.update({ unreadMessages });
  }

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        ...companyWhere,
        contactId: groupContact.id,
        whatsappId: whatsappId
      } as any,
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket && !groupContact) {
    ticket = await Ticket.findOne({
      where: {
        ...companyWhere,
        updatedAt: {
          [Op.between]: [+subHours(new Date(), 2), +new Date()]
        },
        contactId: contact.id,
        whatsappId: whatsappId
      } as any,
      order: [["updatedAt", "DESC"]]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });
    }
  }

  if (!ticket) {
    ticket = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: "pending",
      isGroup: !!groupContact,
      unreadMessages,
      whatsappId,
      companyId: scopedCompanyId
    });
  }

  ticket = await ShowTicketService(ticket.id, scopedCompanyId);

  return ticket;
};

export default FindOrCreateTicketService;
