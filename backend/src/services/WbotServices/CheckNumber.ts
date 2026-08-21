import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import AppError from "../../errors/AppError";
import { getWbot } from "../../libs/wbot";

const resolveWhatsappId = async (whatsappId?: number): Promise<number> => {
  if (whatsappId) {
    return whatsappId;
  }

  const defaultWhatsapp = await GetDefaultWhatsApp();
  return defaultWhatsapp.id;
};

const CheckContactNumber = async (
  number: string,
  whatsappId?: number
): Promise<string> => {
  const selectedWhatsappId = await resolveWhatsappId(whatsappId);
  const wbot = getWbot(selectedWhatsappId);

  try {
    const validNumber: any = await wbot.getNumberId(`${number}@c.us`);
    if (!validNumber?.user) {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }

    return validNumber.user;
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckContactNumber;
