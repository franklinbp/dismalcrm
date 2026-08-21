import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

interface Request {
  whatsappId: number;
  to: string;
  body: string;
  skipInbox?: boolean;
}

const normalizePhone = (value: string): string => value.replace(/\D/g, "");

const SendTextByWhatsappId = async ({
  whatsappId,
  to,
  body,
  skipInbox = false
}: Request) => {
  const number = normalizePhone(to);
  if (!number) {
    throw new AppError("Invalid recipient phone", 400);
  }

  if (!body) {
    throw new AppError("Message body is required", 400);
  }

  const wbot = getWbot(whatsappId);
  const payload = skipInbox ? `\u200e${body}` : body;
  try {
    const registeredNumber = await wbot.getNumberId(`${number}@c.us`);
    const chatId = registeredNumber?._serialized || `${number}@c.us`;
    const sentMessage = await wbot.sendMessage(chatId, payload, {
      linkPreview: false
    });
    return sentMessage;
  } catch (err: any) {
    logger.warn(
      {
        whatsappId,
        to: number.length > 4 ? `${"*".repeat(number.length - 4)}${number.slice(-4)}` : "****",
        error: err?.message || String(err)
      },
      "Failed to send gateway WhatsApp text"
    );
    throw new AppError(`ERR_SENDING_WAPP_MSG: ${err?.message || "unknown error"}`, 400);
  }
};

export default SendTextByWhatsappId;
