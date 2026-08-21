import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import Whatsapp from "../../models/Whatsapp";
import SendTextByWhatsappId from "./SendTextByWhatsappId";

interface Request {
  whatsappId?: number | null;
  number: string;
  body: string;
}

interface Result {
  whatsappId: number;
}

const resolveWhatsapp = async (
  whatsappId: number | null | undefined
): Promise<Whatsapp> => {
  if (whatsappId === undefined || whatsappId === null) {
    return GetDefaultWhatsApp();
  }

  const whatsapp = await Whatsapp.findByPk(whatsappId);
  if (!whatsapp) {
    throw new AppError(`whatsapp #${whatsappId} not found`, 404);
  }

  return whatsapp;
};

// Integration notifications use the same direct sender as campaigns.
// This service deliberately has no dependency on contacts, tickets or inboxes.
const SendGatewayTextService = async ({
  whatsappId,
  number,
  body
}: Request): Promise<Result> => {
  const whatsapp = await resolveWhatsapp(whatsappId);

  await SendTextByWhatsappId({
    whatsappId: whatsapp.id,
    to: number,
    body,
    skipInbox: true
  });

  return { whatsappId: whatsapp.id };
};

export default SendGatewayTextService;
