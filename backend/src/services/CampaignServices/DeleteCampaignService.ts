import Campaign from "../../models/Campaign";
import CampaignRecipient from "../../models/CampaignRecipient";
import OutboxMessage from "../../models/OutboxMessage";
import AppError from "../../errors/AppError";
import CancelCampaignService from "./CancelCampaignService";

const DeleteCampaignService = async (
  campaignId: number | string
): Promise<void> => {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  if (!["COMPLETED", "FAILED", "CANCELED"].includes(campaign.status)) {
    await CancelCampaignService(campaignId);
  }

  await OutboxMessage.destroy({ where: { campaignId } });
  await CampaignRecipient.destroy({ where: { campaignId } });
  await campaign.destroy();
};

export default DeleteCampaignService;
