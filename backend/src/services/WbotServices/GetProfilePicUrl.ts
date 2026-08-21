import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const resolveWhatsappId = async (whatsappId?: number): Promise<number> => {
  if (whatsappId) {
    return whatsappId;
  }

  const defaultWhatsapp = await GetDefaultWhatsApp();
  return defaultWhatsapp.id;
};

const GetProfilePicUrl = async (
  number: string,
  whatsappId?: number
): Promise<string> => {
  const selectedWhatsappId = await resolveWhatsappId(whatsappId);
  const wbot = getWbot(selectedWhatsappId);

  const profilePicUrl = await wbot.getProfilePicUrl(`${number}@c.us`);

  return profilePicUrl;
};

export default GetProfilePicUrl;
