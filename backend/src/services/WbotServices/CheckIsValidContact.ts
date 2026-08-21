import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const resolveWhatsappId = async (whatsappId?: number): Promise<number> => {
  if (whatsappId) {
    return whatsappId;
  }

  const defaultWhatsapp = await GetDefaultWhatsApp();
  return defaultWhatsapp.id;
};

const CheckIsValidContact = async (
  number: string,
  whatsappId?: number
): Promise<void> => {
  const selectedWhatsappId = await resolveWhatsappId(whatsappId);
  const wbot = getWbot(selectedWhatsappId);

  try {
    const isValidNumber = await wbot.isRegisteredUser(`${number}@c.us`);
    if (!isValidNumber) {
      throw new AppError("invalidNumber");
    }
  } catch (err) {
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    throw new AppError("ERR_WAPP_CHECK_CONTACT");
  }
};

export default CheckIsValidContact;
