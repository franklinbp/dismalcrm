import Campaign from "../../models/Campaign";
import CampaignRecipient from "../../models/CampaignRecipient";
import AppError from "../../errors/AppError";

const DuplicateCampaignService = async (
  campaignId: number | string
): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(campaignId, {
    include: [{ model: CampaignRecipient }]
  });

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  const duplicated = await Campaign.create({
    name: `${campaign.name} - copia`,
    messageBody: campaign.messageBody,
    mediaUrl: campaign.mediaUrl || null,
    mediaType: campaign.mediaType || null,
    senderMode: campaign.senderMode,
    senderId: campaign.senderId || null,
    ratePerMin: campaign.ratePerMin || null,
    scheduleAt: null,
    status: "DRAFT"
  });

  const recipients = campaign.recipients || [];
  if (recipients.length > 0) {
    await CampaignRecipient.bulkCreate(
      recipients.map(recipient => ({
        campaignId: duplicated.id,
        phoneE164: recipient.phoneE164,
        name: recipient.name || null,
        status: "PENDING"
      })),
      { ignoreDuplicates: true }
    );
  }

  return duplicated;
};

export default DuplicateCampaignService;
