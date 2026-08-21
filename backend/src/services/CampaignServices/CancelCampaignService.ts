import Campaign from "../../models/Campaign";
import OutboxMessage from "../../models/OutboxMessage";
import CampaignRecipient from "../../models/CampaignRecipient";
import AppError from "../../errors/AppError";

const CancelCampaignService = async (campaignId: number | string): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  if (["COMPLETED", "FAILED", "CANCELED"].includes(campaign.status)) {
    return campaign;
  }

  await campaign.update({ status: "CANCELED" });

  await OutboxMessage.update(
    { status: "FAILED", lastError: "Canceled" },
    { where: { campaignId, status: "PENDING" } }
  );

  await CampaignRecipient.update(
    { status: "FAILED" },
    { where: { campaignId, status: ["PENDING", "RETRYING"] } }
  );

  return campaign;
};

export default CancelCampaignService;
