import Contact from "../../models/Contact";
import CampaignClient from "../../models/CampaignClient";
import {
  getCountryCodeFromE164,
  normalizePhoneToE164
} from "../../helpers/PhoneFormatter";
import { logger } from "../../utils/logger";
import AppError from "../../errors/AppError";

interface ServiceResult {
  client: CampaignClient;
  created: boolean;
  updated: boolean;
}

interface CampaignClientUpdateData {
  name?: string;
  email?: string;
  category?: string;
  countryCode?: string;
}

const normalizeContactPhone = (phone?: string): string | null => {
  if (!phone) return null;

  const cleanPhone = phone.replace(/\D/g, "");
  if (!cleanPhone) return null;

  try {
    return normalizePhoneToE164(
      phone.trim().startsWith("+") ? phone : `+${cleanPhone}`
    );
  } catch (err) {
    logger.warn(
      `Skipping contact campaign import due to invalid phone: ${phone}`
    );
    return null;
  }
};

const shouldReplaceName = (
  currentName?: string,
  newName?: string,
  phone?: string
): boolean => {
  if (!newName) return false;
  if (!currentName) return true;
  return !!phone && currentName.replace(/\D/g, "") === phone.replace(/\D/g, "");
};

const AddContactToCampaignClientService = async (
  contactId: string
): Promise<ServiceResult> => {
  const contact = await Contact.findByPk(contactId);

  if (!contact || contact.isGroup) {
    throw new AppError("Contact not found", 404);
  }

  const phoneE164 = normalizeContactPhone(contact.number);

  if (!phoneE164) {
    throw new AppError("Invalid contact phone", 400);
  }

  const name = contact.name || phoneE164;
  const email = contact.email || null;
  const countryCode = getCountryCodeFromE164(phoneE164);
  const client = await CampaignClient.findOne({ where: { phoneE164 } });

  if (!client) {
    const createdClient = await CampaignClient.create({
      name,
      phoneE164,
      countryCode,
      email,
      category: "whatsapp"
    });

    return { client: createdClient, created: true, updated: false };
  }

  const nextData: CampaignClientUpdateData = {};

  if (shouldReplaceName(client.name, contact.name, contact.number)) {
    nextData.name = name;
  }

  if (!client.email && email) {
    nextData.email = email;
  }

  if (!client.category) {
    nextData.category = "whatsapp";
  }

  if (!client.countryCode && countryCode) {
    nextData.countryCode = countryCode;
  }

  if (Object.keys(nextData).length > 0) {
    await client.update(nextData);
    return { client, created: false, updated: true };
  }

  return { client, created: false, updated: false };
};

export default AddContactToCampaignClientService;
