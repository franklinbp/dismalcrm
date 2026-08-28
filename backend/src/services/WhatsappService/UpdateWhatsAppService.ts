import * as Yup from "yup";
import { Op } from "sequelize";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import ShowWhatsAppService from "./ShowWhatsAppService";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";

interface WhatsappData {
  name?: string;
  status?: string;
  session?: string;
  isDefault?: boolean;
  greetingMessage?: string;
  farewellMessage?: string;
  queueIds?: number[];
  channel?: string;
  facebookUserToken?: string;
  tokenMeta?: string;
  facebookUserId?: string;
  facebookPageUserId?: string;
}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
  companyId?: number;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId,
  companyId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    status: Yup.string(),
    isDefault: Yup.boolean()
  });

  const {
    name,
    status,
    isDefault,
    session,
    greetingMessage,
    farewellMessage,
    queueIds = [],
    channel,
    facebookUserToken,
    tokenMeta,
    facebookUserId,
    facebookPageUserId
  } = whatsappData;

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err) {
    throw new AppError(err.message);
  }

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: true, id: { [Op.not]: whatsappId } }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  const whatsapp = await ShowWhatsAppService(whatsappId);
  const nextChannel = channel || whatsapp.channel || "whatsapp";

  if (nextChannel === "whatsapp" && queueIds.length > 1 && !greetingMessage) {
    throw new AppError("ERR_WAPP_GREETING_REQUIRED");
  }

  await whatsapp.update({
    name,
    status: nextChannel === "whatsapp" ? status : status || "CONNECTED",
    session,
    greetingMessage,
    farewellMessage,
    isDefault: nextChannel === "whatsapp" ? isDefault : false,
    channel: nextChannel,
    facebookUserToken,
    tokenMeta,
    facebookUserId,
    facebookPageUserId,
    companyId: whatsapp.companyId || companyId
  });

  if (nextChannel === "whatsapp") {
    await AssociateWhatsappQueue(whatsapp, queueIds);
  }

  return { whatsapp, oldDefaultWhatsapp };
};

export default UpdateWhatsAppService;
