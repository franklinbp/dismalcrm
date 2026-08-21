import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";
import renderTemplate from "./TemplateRenderer";

interface Variables {
  [key: string]: string | number | null | undefined;
}

const PreviewCampaignService = async (
  campaignId: number | string,
  variables: Variables
): Promise<string> => {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  return renderTemplate(campaign.messageBody, variables || {});
};

export default PreviewCampaignService;
