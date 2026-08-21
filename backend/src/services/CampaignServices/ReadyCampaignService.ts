import Campaign from "../../models/Campaign";
import CampaignRecipient from "../../models/CampaignRecipient";
import OutboxMessage from "../../models/OutboxMessage";
import Sender from "../../models/Sender";
import AppError from "../../errors/AppError";
import renderTemplate from "./TemplateRenderer";

const ReadyCampaignService = async (campaignId: number | string): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(campaignId, {
    include: [{ model: CampaignRecipient }]
  });

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  if (campaign.status !== "DRAFT") {
    throw new AppError("Only DRAFT campaigns can be marked READY", 400);
  }

  if (campaign.senderMode === "SINGLE") {
    if (!campaign.senderId) {
      throw new AppError("Sender is required for SINGLE mode", 400);
    }

    const sender = await Sender.findByPk(campaign.senderId);
    if (!sender) {
      throw new AppError("Sender not found", 404);
    }
  }

  const recipients = Array.from(
    (campaign.recipients || [])
      .reduce((acc, recipient) => {
        if (!acc.has(recipient.phoneE164)) {
          acc.set(recipient.phoneE164, recipient);
        }
        return acc;
      }, new Map<string, CampaignRecipient>())
      .values()
  );
  if (recipients.length === 0) {
    throw new AppError("No recipients imported", 400);
  }

  const runAt = campaign.scheduleAt ? new Date(campaign.scheduleAt) : new Date();

  const outboxRows = recipients.map(recipient => ({
    campaignId: campaign.id,
    recipientId: recipient.id,
    senderId: campaign.senderMode === "SINGLE" ? campaign.senderId : null,
    to: recipient.phoneE164,
    body: renderTemplate(campaign.messageBody, {
      name: recipient.name || "",
      phone: recipient.phoneE164
    }),
    status: "PENDING",
    runAt
  }));

  await OutboxMessage.bulkCreate(outboxRows, { ignoreDuplicates: true });

  await campaign.update({ status: "READY" });

  return campaign;
};

export default ReadyCampaignService;
