import path from "path";
import { promises as fs } from "fs";
import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";
import uploadConfig from "../../config/upload";

interface Request {
  campaignId: number | string;
  filename: string;
  mimeType: string;
}

const UpdateCampaignMediaService = async ({
  campaignId,
  filename,
  mimeType
}: Request): Promise<Campaign> => {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  if (campaign.status !== "DRAFT") {
    throw new AppError("Only DRAFT campaigns can update media", 400);
  }

  if (!filename) {
    throw new AppError("Media file is required", 400);
  }

  if (campaign.mediaUrl && campaign.mediaUrl !== filename) {
    const oldPath = path.join(uploadConfig.directory, campaign.mediaUrl);
    try {
      await fs.unlink(oldPath);
    } catch (err) {
      // ignore missing file
    }
  }

  await campaign.update({
    mediaUrl: filename,
    mediaType: mimeType || null
  });

  return campaign;
};

export default UpdateCampaignMediaService;
