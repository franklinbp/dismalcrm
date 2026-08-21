import * as Yup from "yup";
import Campaign, { CampaignSenderMode } from "../../models/Campaign";
import Sender from "../../models/Sender";
import AppError from "../../errors/AppError";

interface Request {
  name: string;
  messageBody: string;
  senderMode: CampaignSenderMode;
  senderId?: number;
  ratePerMin?: number;
  scheduleAt?: Date | string | null;
}

const CreateCampaignService = async (data: Request): Promise<Campaign> => {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    messageBody: Yup.string().required(),
    senderMode: Yup.string().oneOf(["SINGLE", "ROUND_ROBIN"]).required(),
    senderId: Yup.number().nullable(),
    ratePerMin: Yup.number().nullable(),
    scheduleAt: Yup.date().nullable()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (data.senderMode === "SINGLE" && !data.senderId) {
    throw new AppError("Sender is required for SINGLE mode");
  }

  if (data.senderId) {
    const sender = await Sender.findByPk(data.senderId);
    if (!sender) {
      throw new AppError("Sender not found", 404);
    }
  }

  const campaign = await Campaign.create({
    name: data.name,
    messageBody: data.messageBody,
    senderMode: data.senderMode,
    senderId: data.senderId || null,
    ratePerMin: data.ratePerMin || null,
    scheduleAt: data.scheduleAt ? new Date(data.scheduleAt) : null,
    status: "DRAFT"
  });

  return campaign;
};

export default CreateCampaignService;
