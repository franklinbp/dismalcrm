import * as Yup from "yup";
import Campaign from "../../models/Campaign";
import Sender from "../../models/Sender";
import AppError from "../../errors/AppError";

interface Request {
  campaignId: number | string;
  name?: string;
  messageBody?: string;
  senderMode?: "SINGLE" | "ROUND_ROBIN";
  senderId?: number | null;
  ratePerMin?: number | null;
  scheduleAt?: Date | string | null;
}

const UpdateCampaignService = async (data: Request): Promise<Campaign> => {
  const schema = Yup.object().shape({
    name: Yup.string(),
    messageBody: Yup.string(),
    senderMode: Yup.string().oneOf(["SINGLE", "ROUND_ROBIN"]),
    senderId: Yup.number().nullable(),
    ratePerMin: Yup.number().nullable(),
    scheduleAt: Yup.date().nullable()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const campaign = await Campaign.findByPk(data.campaignId);
  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  if (campaign.status !== "DRAFT") {
    throw new AppError("Only DRAFT campaigns can be updated", 400);
  }

  const nextSenderMode = data.senderMode || campaign.senderMode;
  const nextSenderId = data.senderId !== undefined ? data.senderId : campaign.senderId;

  if (nextSenderMode === "SINGLE" && !nextSenderId) {
    throw new AppError("Sender is required for SINGLE mode", 400);
  }

  if (nextSenderId) {
    const sender = await Sender.findByPk(nextSenderId);
    if (!sender) {
      throw new AppError("Sender not found", 404);
    }
  }

  await campaign.update({
    name: data.name ?? campaign.name,
    messageBody: data.messageBody ?? campaign.messageBody,
    senderMode: nextSenderMode,
    senderId: nextSenderId || null,
    ratePerMin: data.ratePerMin !== undefined ? data.ratePerMin : campaign.ratePerMin,
    scheduleAt:
      data.scheduleAt !== undefined
        ? data.scheduleAt
          ? new Date(data.scheduleAt)
          : null
        : campaign.scheduleAt
  });

  return campaign;
};

export default UpdateCampaignService;
