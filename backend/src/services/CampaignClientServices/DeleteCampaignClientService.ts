import CampaignClient from "../../models/CampaignClient";
import AppError from "../../errors/AppError";

const DeleteCampaignClientService = async (clientId: string): Promise<void> => {
  const client = await CampaignClient.findByPk(clientId);
  if (!client) {
    throw new AppError("Client not found", 404);
  }
  await client.destroy();
};

export default DeleteCampaignClientService;
