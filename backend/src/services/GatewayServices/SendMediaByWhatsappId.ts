import { getWbot } from "../../libs/wbot";
import AppError from "../../errors/AppError";
import { MessageMedia } from "whatsapp-web.js";

interface Request {
  whatsappId: number;
  to: string;
  filePath: string;
  caption?: string;
  skipInbox?: boolean;
}

const normalizePhone = (value: string): string => value.replace(/\D/g, "");

const SendMediaByWhatsappId = async ({
  whatsappId,
  to,
  filePath,
  caption,
  skipInbox = false
}: Request) => {
  const number = normalizePhone(to);
  if (!number) {
    throw new AppError("Invalid recipient phone", 400);
  }

  if (!filePath) {
    throw new AppError("Media file path is required", 400);
  }

  const wbot = getWbot(whatsappId);
  const finalCaption = caption && skipInbox ? `\u200e${caption}` : caption;

  const newMedia = MessageMedia.fromFilePath(filePath);

  const sentMessage = await wbot.sendMessage(`${number}@c.us`, newMedia, { caption: finalCaption });
  return sentMessage;
};

export default SendMediaByWhatsappId;
