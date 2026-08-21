import { Request, Response } from "express";
import CreateCampaignService from "../services/CampaignServices/CreateCampaignService";
import ListCampaignsService from "../services/CampaignServices/ListCampaignsService";
import ShowCampaignService from "../services/CampaignServices/ShowCampaignService";
import UpdateCampaignService from "../services/CampaignServices/UpdateCampaignService";
import ImportRecipientsService from "../services/CampaignServices/ImportRecipientsService";
import ListRecipientsService from "../services/CampaignServices/ListRecipientsService";
import PreviewCampaignService from "../services/CampaignServices/PreviewCampaignService";
import ReadyCampaignService from "../services/CampaignServices/ReadyCampaignService";
import CancelCampaignService from "../services/CampaignServices/CancelCampaignService";
import CampaignMetricsService from "../services/CampaignServices/CampaignMetricsService";
import UpdateCampaignMediaService from "../services/CampaignServices/UpdateCampaignMediaService";
import DeleteCampaignService from "../services/CampaignServices/DeleteCampaignService";
import DuplicateCampaignService from "../services/CampaignServices/DuplicateCampaignService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const campaigns = await ListCampaignsService();
  return res.status(200).json(campaigns);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { campaignId } = req.params;
  const campaign = await ShowCampaignService(campaignId);
  return res.status(200).json(campaign);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const campaign = await CreateCampaignService(req.body);
  return res.status(201).json(campaign);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { campaignId } = req.params;
  const campaign = await UpdateCampaignService({
    campaignId,
    ...req.body
  });
  return res.status(200).json(campaign);
};

export const importRecipients = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { campaignId } = req.params;
  const imported = await ImportRecipientsService(campaignId, req.body || []);
  return res.status(200).json({ imported });
};

export const listRecipients = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { campaignId } = req.params;
  const recipients = await ListRecipientsService(campaignId);
  return res.status(200).json(recipients);
};

export const preview = async (req: Request, res: Response): Promise<Response> => {
  const { campaignId } = req.params;
  const rendered = await PreviewCampaignService(campaignId, req.body || {});
  return res.status(200).json({ rendered });
};

export const ready = async (req: Request, res: Response): Promise<Response> => {
  const { campaignId } = req.params;
  const campaign = await ReadyCampaignService(campaignId);
  return res.status(200).json(campaign);
};

export const cancel = async (req: Request, res: Response): Promise<Response> => {
  const { campaignId } = req.params;
  const campaign = await CancelCampaignService(campaignId);
  return res.status(200).json(campaign);
};

export const metrics = async (req: Request, res: Response): Promise<Response> => {
  const { campaignId } = req.params;
  const result = await CampaignMetricsService(campaignId);
  return res.status(200).json(result);
};

export const destroy = async (req: Request, res: Response): Promise<Response> => {
  const { campaignId } = req.params;
  await DeleteCampaignService(campaignId);
  return res.status(200).json({ deleted: true });
};

export const duplicate = async (req: Request, res: Response): Promise<Response> => {
  const { campaignId } = req.params;
  const campaign = await DuplicateCampaignService(campaignId);
  return res.status(201).json(campaign);
};

export const uploadMedia = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { campaignId } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "Media file is required" });
  }

  const campaign = await UpdateCampaignMediaService({
    campaignId,
    filename: file.filename,
    mimeType: file.mimetype
  });

  return res.status(200).json(campaign);
};
