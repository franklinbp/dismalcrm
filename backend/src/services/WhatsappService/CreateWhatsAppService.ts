import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";
import { getWhatsappConnectionLimit } from "./WhatsappConnectionPolicy";

interface Request {
  name: string;
  companyId: number;
  queueIds?: number[];
  greetingMessage?: string;
  farewellMessage?: string;
  status?: string;
  isDefault?: boolean;
  channel?: string;
  facebookUserToken?: string;
  tokenMeta?: string;
  facebookUserId?: string;
  facebookPageUserId?: string;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const CreateWhatsAppService = async ({
  name,
  companyId,
  status = "OPENING",
  queueIds = [],
  greetingMessage,
  farewellMessage,
  isDefault = false,
  channel = "whatsapp",
  facebookUserToken,
  tokenMeta,
  facebookUserId,
  facebookPageUserId
}: Request): Promise<Response> => {
  if (channel === "whatsapp") {
    const connectionLimit = getWhatsappConnectionLimit();
    const connectionCount = await Whatsapp.count({
      where: { channel: "whatsapp" }
    });

    if (connectionCount >= connectionLimit) {
      throw new AppError("ERR_WAPP_CONNECTION_LIMIT", 409);
    }
  }

  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This whatsapp name is already used.",
        async value => {
          if (!value) return false;
          const nameExists = await Whatsapp.findOne({
            where: { name: value }
          });
          return !nameExists;
        }
      ),
    isDefault: Yup.boolean().required()
  });

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err) {
    throw new AppError(err.message);
  }

  const whatsappFound = await Whatsapp.findOne({
    where: { channel: "whatsapp" }
  });

  isDefault = channel === "whatsapp" ? !whatsappFound : false;

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: true }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  if (channel === "whatsapp" && queueIds.length > 1 && !greetingMessage) {
    throw new AppError("ERR_WAPP_GREETING_REQUIRED");
  }

  const whatsapp = await Whatsapp.create(
    {
      name,
      companyId,
      status: channel === "whatsapp" ? status : status || "CONNECTED",
      greetingMessage,
      farewellMessage,
      isDefault,
      channel,
      facebookUserToken,
      tokenMeta,
      facebookUserId,
      facebookPageUserId
    },
    { include: ["queues"] }
  );

  if (channel === "whatsapp") {
    await AssociateWhatsappQueue(whatsapp, queueIds);
  }

  return { whatsapp, oldDefaultWhatsapp };
};

export default CreateWhatsAppService;
