import CampaignClient from "../../models/CampaignClient";
import AppError from "../../errors/AppError";
import {
  getCountryCodeFromE164,
  normalizePhoneToE164
} from "../../helpers/PhoneFormatter";

interface Request {
  clientId: string;
  name?: string;
  tradeName?: string;
  phone?: string;
  countryCode?: string;
  email?: string;
  category?: string;
  source?: string;
  segment?: string;
}

const UpdateCampaignClientService = async ({
  clientId,
  name,
  tradeName,
  phone,
  countryCode,
  email,
  category,
  source,
  segment
}: Request): Promise<CampaignClient> => {
  const client = await CampaignClient.findByPk(clientId);
  if (!client) {
    throw new AppError("Client not found", 404);
  }

  let phoneE164 = client.phoneE164;
  let finalCountry = client.countryCode;

  if (phone || countryCode) {
    phoneE164 = normalizePhoneToE164(phone || client.phoneE164, countryCode || client.countryCode || undefined);
    finalCountry = countryCode || getCountryCodeFromE164(phoneE164) || client.countryCode;

    const exists = await CampaignClient.findOne({
      where: { phoneE164 }
    });
    if (exists && exists.id !== client.id) {
      throw new AppError("Client phone already exists", 400);
    }
  }

  await client.update({
    name: name !== undefined ? name : client.name,
    tradeName: tradeName !== undefined ? tradeName : client.tradeName,
    phoneE164,
    countryCode: finalCountry,
    email: email !== undefined ? email : client.email,
    category: category !== undefined ? category : client.category,
    source: source !== undefined ? source : client.source,
    segment: segment !== undefined ? segment : client.segment
  });

  return client;
};

export default UpdateCampaignClientService;
