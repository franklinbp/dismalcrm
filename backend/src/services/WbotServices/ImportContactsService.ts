import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import ContactModel from "../../models/Contact";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";
import EnsureWhatsappCompanyService from "../WhatsappService/EnsureWhatsappCompanyService";
import { isAllowedWhatsappNumber } from "../WhatsappService/WhatsappConnectionPolicy";
import type { Chat as WbotChat, Contact as WbotContact } from "whatsapp-web.js";

export interface ImportContactsSummary {
  total: number;
  created: number;
  updated: number;
  existing: number;
  skipped: number;
}

const getContactNumber = (contact: WbotContact): string => {
  return (contact.number || contact.id?.user || "").replace(/\D/g, "");
};

const getContactName = (contact: WbotContact, number: string): string => {
  return (
    contact.name ||
    contact.pushname ||
    contact.shortName ||
    contact.verifiedName ||
    number
  ).trim();
};

const shouldSkipContact = (contact: WbotContact, number: string): boolean => {
  if (!number) return true;
  if (contact.isGroup || contact.id?.server === "g.us") return true;
  if (contact.isMe) return true;
  if (contact.isUser === false) return true;
  if (contact.isWAContact === false) return true;
  return !isAllowedWhatsappNumber(number);
};

const shouldUpdateName = (
  currentName: string | undefined,
  nextName: string,
  number: string
): boolean => {
  if (!nextName || nextName === number) return false;
  if (!currentName) return true;
  return currentName.replace(/\D/g, "") === number;
};

const ImportContactsService = async (
  userId: number
): Promise<ImportContactsSummary> => {
  const defaultWhatsapp = await EnsureWhatsappCompanyService(
    await GetDefaultWhatsApp(userId)
  );

  if (!defaultWhatsapp.companyId) {
    throw new AppError("ERR_WAPP_COMPANY_NOT_ASSIGNED", 400);
  }

  const wbot = getWbot(defaultWhatsapp.id);
  const summary: ImportContactsSummary = {
    total: 0,
    created: 0,
    updated: 0,
    existing: 0,
    skipped: 0
  };

  let chats: WbotChat[] = [];

  try {
    chats = await wbot.getChats();
    summary.total = chats.length;
  } catch (err) {
    logger.error({ err }, "Could not get WhatsApp chats for contact import");
    throw new AppError("ERR_WAPP_IMPORT_CONTACTS", 500);
  }

  const processedNumbers = new Set<string>();

  for (const chat of chats) {
    if (chat.isGroup || chat.id?.server === "g.us") {
      summary.skipped += 1;
      continue;
    }

    let phoneContact: WbotContact;

    try {
      phoneContact = await chat.getContact();
    } catch (err) {
      logger.warn(
        { err, chatId: chat.id?._serialized },
        "Could not get WhatsApp contact from chat"
      );
      summary.skipped += 1;
      continue;
    }

    const number = getContactNumber(phoneContact);

    if (processedNumbers.has(number) || shouldSkipContact(phoneContact, number)) {
      summary.skipped += 1;
      continue;
    }

    processedNumbers.add(number);
    const name = getContactName(phoneContact, number);

    const existingContact = await ContactModel.findOne({
      where: { number }
    });

    if (!existingContact) {
      await ContactModel.create({
        name,
        number,
        email: "",
        isGroup: false,
        companyId: defaultWhatsapp.companyId,
        channel: "whatsapp"
      });
      summary.created += 1;
      continue;
    }

    const nextData: {
      companyId?: number;
      name?: string;
      channel?: string;
    } = {};

    if (!existingContact.companyId) {
      nextData.companyId = defaultWhatsapp.companyId;
    }

    if (shouldUpdateName(existingContact.name, name, number)) {
      nextData.name = name;
    }

    if (!existingContact.channel) {
      nextData.channel = "whatsapp";
    }

    if (Object.keys(nextData).length > 0) {
      await existingContact.update(nextData);
      summary.updated += 1;
      continue;
    }

    summary.existing += 1;
  }

  logger.info(
    {
      whatsappId: defaultWhatsapp.id,
      companyId: defaultWhatsapp.companyId,
      ...summary
    },
    "WhatsApp chat contacts imported"
  );

  return summary;
};

export default ImportContactsService;
