import Campaign from "../../models/Campaign";
import Sender from "../../models/Sender";

const ListCampaignsService = async (): Promise<Campaign[]> => {
  const campaigns = await Campaign.findAll({
    order: [["createdAt", "DESC"]],
    include: [{ model: Sender }]
  });
  return campaigns;
};

export default ListCampaignsService;
