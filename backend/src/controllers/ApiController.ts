import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import GetDefaultWhatsApp from "../helpers/GetDefaultWhatsApp";
import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import Message from "../models/Message";
import Whatsapp from "../models/Whatsapp";
import CreateOrUpdateContactService from "../services/ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import SendTextByWhatsappId from "../services/GatewayServices/SendTextByWhatsappId";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";
import { logger } from "../utils/logger";

type WhatsappData = {
  whatsappId?: number | null;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

interface ContactData {
  number: string;
}

const createContact = async (
  whatsappId: number | null | undefined,
  newContact: string
) => {
  let whatsapp: Whatsapp | null;

  if (whatsappId === undefined || whatsappId === null) {
    whatsapp = await GetDefaultWhatsApp();
  } else {
    whatsapp = await Whatsapp.findByPk(whatsappId);

    if (whatsapp === null) {
      throw new AppError(`whatsapp #${whatsappId} not found`);
    }
  }

  if (!whatsapp.companyId) {
    throw new AppError("ERR_WAPP_COMPANY_REQUIRED", 409);
  }

  await CheckIsValidContact(newContact, whatsapp.id);

  const validNumber: any = await CheckContactNumber(newContact, whatsapp.id);

  let profilePicUrl = "";
  try {
    profilePicUrl = await GetProfilePicUrl(validNumber, whatsapp.id);
  } catch (_err) {
    profilePicUrl = "";
  }

  const number = validNumber;

  const contactData = {
    name: `${number}`,
    number,
    profilePicUrl,
    isGroup: false,
    companyId: whatsapp.companyId,
    channel: "whatsapp"
  };

  const contact = await CreateOrUpdateContactService(contactData);

  const createTicket = await FindOrCreateTicketService(
    contact,
    whatsapp.id,
    1,
    undefined,
    whatsapp.companyId
  );

  const ticket = await ShowTicketService(createTicket.id, whatsapp.companyId);

  SetTicketMessagesAsRead(ticket);

  return ticket;
};

const resolveWhatsapp = async (
  whatsappId: number | null | undefined
): Promise<Whatsapp> => {
  if (whatsappId === undefined || whatsappId === null) {
    return GetDefaultWhatsApp();
  }

  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (whatsapp === null) {
    throw new AppError(`whatsapp #${whatsappId} not found`);
  }

  return whatsapp;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  const { whatsappId }: WhatsappData = req.body;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  if (!newContact.number) {
    throw new AppError("number is required");
  }

  newContact.number = newContact.number.replace(/\D/g, "");
  const maskedNumber =
    newContact.number.length > 4
      ? `${"*".repeat(
          Math.max(newContact.number.length - 4, 0)
        )}${newContact.number.slice(-4)}`
      : "****";

  logger.info(
    {
      whatsappId: whatsappId ?? null,
      number: maskedNumber,
      hasBody: Boolean(body),
      mediaCount: medias?.length ?? 0
    },
    "API WhatsApp send requested"
  );

  const schema = Yup.object().shape({
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if ((!medias || medias.length === 0) && !quotedMsg) {
    const whatsapp = await resolveWhatsapp(whatsappId);
    await SendTextByWhatsappId({
      whatsappId: whatsapp.id,
      to: newContact.number,
      body,
      skipInbox: true
    });

    logger.info(
      {
        whatsappId: whatsapp.id,
        number: maskedNumber
      },
      "API WhatsApp direct send completed"
    );

    return res.send();
  }

  const contactAndTicket = await createContact(whatsappId, newContact.number);

  if (medias && medias.length > 0) {
    await Promise.all(
      medias.map(async (media: Express.Multer.File) => {
        await SendWhatsAppMedia({ body, media, ticket: contactAndTicket });
      })
    );
  } else {
    if (quotedMsg) {
      await SendWhatsAppMessage({ body, ticket: contactAndTicket, quotedMsg });
    } else {
      await SendTextByWhatsappId({
        whatsappId: contactAndTicket.whatsappId,
        to: newContact.number,
        body,
        skipInbox: true
      });
    }
  }

  logger.info(
    {
      whatsappId: whatsappId ?? null,
      number: maskedNumber,
      ticketId: contactAndTicket.id
    },
    "API WhatsApp send completed"
  );

  return res.send();
};
