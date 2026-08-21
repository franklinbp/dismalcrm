import { Request, Response } from "express";
import * as Yup from "yup";
import AppError from "../errors/AppError";
import CreateCampaignClientService from "../services/CampaignClientServices/CreateCampaignClientService";
import ListCampaignClientService from "../services/CampaignClientServices/ListCampaignClientService";
import ShowCampaignClientService from "../services/CampaignClientServices/ShowCampaignClientService";
import UpdateCampaignClientService from "../services/CampaignClientServices/UpdateCampaignClientService";
import DeleteCampaignClientService from "../services/CampaignClientServices/DeleteCampaignClientService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  countryCode: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, countryCode } = req.query as IndexQuery;

  const { clients, count, hasMore } = await ListCampaignClientService({
    searchParam,
    pageNumber,
    countryCode
  });

  return res.json({ clients, count, hasMore });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { clientId } = req.params;
  const client = await ShowCampaignClientService(clientId);
  return res.status(200).json(client);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    tradeName: Yup.string(),
    phone: Yup.string().required(),
    countryCode: Yup.string(),
    email: Yup.string().email().nullable(),
    category: Yup.string()
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const client = await CreateCampaignClientService(req.body);
  return res.status(201).json(client);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { clientId } = req.params;

  const schema = Yup.object().shape({
    name: Yup.string(),
    tradeName: Yup.string(),
    phone: Yup.string(),
    countryCode: Yup.string(),
    email: Yup.string().email().nullable(),
    category: Yup.string()
  });

  try {
    await schema.validate(req.body);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const client = await UpdateCampaignClientService({
    clientId,
    ...req.body
  });
  return res.status(200).json(client);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { clientId } = req.params;
  await DeleteCampaignClientService(clientId);
  return res.status(200).json({ message: "Client deleted" });
};
