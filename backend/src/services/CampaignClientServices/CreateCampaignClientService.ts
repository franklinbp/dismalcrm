import CampaignClient from "../../models/CampaignClient";
import AppError from "../../errors/AppError";
import {
  getCountryCodeFromE164,
  normalizePhoneToE164
} from "../../helpers/PhoneFormatter";

interface Request {
  name: string;
  tradeName?: string;
  phone: string;
  countryCode?: string;
  email?: string;
  category?: string;
}

const CreateCampaignClientService = async ({
  name,
  tradeName,
  phone,
  countryCode,
  email,
  category
}: Request): Promise<CampaignClient> => {
  if (!name) {
    throw new AppError("Name is required", 400);
  }

  const phoneE164 = normalizePhoneToE164(phone, countryCode);
  const finalCountryCode = countryCode || getCountryCodeFromE164(phoneE164);

  const exists = await CampaignClient.findOne({
    where: { phoneE164 }
  });
  if (exists) {
    throw new AppError("Client phone already exists", 400);
  }

  const client = await CampaignClient.create({
    name,
    tradeName: tradeName || null,
    phoneE164,
    countryCode: finalCountryCode || null,
    email: email || null,
    category: category || null
  });

  return client;
};

export default CreateCampaignClientService;
