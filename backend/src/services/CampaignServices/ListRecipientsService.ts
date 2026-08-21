import CampaignRecipient from "../../models/CampaignRecipient";

const ListRecipientsService = async (
  campaignId: number | string
): Promise<CampaignRecipient[]> => {
  const recipients = await CampaignRecipient.findAll({
    where: { campaignId },
    order: [["id", "ASC"]]
  });

  return recipients;
};

export default ListRecipientsService;
