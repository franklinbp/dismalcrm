import fs from "fs";
import path from "path";
import { MessageMedia } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import formatBody from "../../helpers/Mustache";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import ShowTicketService from "../TicketServices/ShowTicketService";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import QuickAnswer from "../../models/QuickAnswer";
import uploadConfig from "../../config/upload";

interface Request {
  quickAnswerId: string;
  ticketId: string;
  messageOverride?: string;
}

const SendQuickAnswerService = async ({
  quickAnswerId,
  ticketId,
  messageOverride
}: Request): Promise<void> => {
  const quickAnswer = await QuickAnswer.findByPk(quickAnswerId);
  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWERS_FOUND", 404);
  }

  const ticket = await ShowTicketService(ticketId);

  const messageBody =
    messageOverride !== undefined ? messageOverride : quickAnswer.message;

  if (quickAnswer.mediaUrl) {
    const filePath = path.join(uploadConfig.directory, quickAnswer.mediaUrl);
    if (!fs.existsSync(filePath)) {
      throw new AppError("Quick answer media not found", 404);
    }

    const wbot = await GetTicketWbot(ticket);
    const caption = messageBody
      ? formatBody(messageBody, ticket.contact)
      : undefined;

    const jid = `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`;
    const newMedia = MessageMedia.fromFilePath(filePath);
    
    const isAudio = newMedia.mimetype.startsWith("audio/");

    await wbot.sendMessage(jid, newMedia, { 
      caption,
      sendAudioAsVoice: isAudio
    });

    await ticket.update({
      lastMessage: messageBody || quickAnswer.mediaName || quickAnswer.mediaUrl
    });
    return;
  }

  if (!messageBody) {
    throw new AppError("Quick answer message is empty", 400);
  }

  await SendWhatsAppMessage({
    body: messageBody,
    ticket
  });
};

export default SendQuickAnswerService;
