import CampaignClient from "../../models/CampaignClient";
import AppError from "../../errors/AppError";

const ShowCampaignClientService = async (
  clientId: string
): Promise<CampaignClient> => {
  const client = await CampaignClient.findByPk(clientId);
  if (!client) {
    throw new AppError("Client not found", 404);
  }
  return client;
};

export default ShowCampaignClientService;
