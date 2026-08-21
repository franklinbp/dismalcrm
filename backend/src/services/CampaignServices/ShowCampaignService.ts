import Campaign from "../../models/Campaign";
import Sender from "../../models/Sender";
import AppError from "../../errors/AppError";

const ShowCampaignService = async (id: number | string): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(id, {
    include: [{ model: Sender }]
  });

  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  return campaign;
};

export default ShowCampaignService;
