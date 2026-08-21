import fs from "fs";
import path from "path";
import {
  MessageMedia,
  Message as WbotMessage,
  MessageSendOptions
} from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";

import formatBody from "../../helpers/Mustache";

interface Request {
  media?: Express.Multer.File;
  mediaPath?: string;
  mediaName?: string;
  mediaType?: string;
  ticket: Ticket;
  body?: string;
  deleteFile?: boolean;
}

const SendWhatsAppMedia = async ({
  media,
  mediaPath,
  mediaName,
  mediaType,
  ticket,
  body,
  deleteFile = true
}: Request): Promise<WbotMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);
    const hasBody = body
      ? formatBody(body as string, ticket.contact)
      : undefined;

    const filePath = media?.path || mediaPath;
    if (!filePath) {
      throw new AppError("ERR_SENDING_WAPP_MSG");
    }

    const filename = media?.filename || mediaName || path.basename(filePath);
    const mimetype = media?.mimetype || mediaType || "application/octet-stream";

    const newMedia = MessageMedia.fromFilePath(filePath);

    let mediaOptions: MessageSendOptions = {
      caption: hasBody,
      sendAudioAsVoice: mimetype.startsWith("audio/")
    };

    if (
      newMedia.mimetype.startsWith("image/") &&
      !/^.*\.(jpe?g|png|gif)?$/i.exec(filename)
    ) {
      mediaOptions["sendMediaAsDocument"] = true;
    }

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
      newMedia,
      mediaOptions
    );

    await ticket.update({ lastMessage: hasBody || filename });

    if (deleteFile && media?.path && fs.existsSync(media.path)) {
      fs.unlinkSync(media.path);
    }

    return sentMessage;
  } catch (err) {
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
