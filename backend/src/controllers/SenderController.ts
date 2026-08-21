import { Request, Response } from "express";
import CreateSenderService from "../services/SenderServices/CreateSenderService";
import ListSendersService from "../services/SenderServices/ListSendersService";
import ShowSenderService from "../services/SenderServices/ShowSenderService";
import UpdateSenderService from "../services/SenderServices/UpdateSenderService";
import DeleteSenderService from "../services/SenderServices/DeleteSenderService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const senders = await ListSendersService();
  return res.status(200).json(senders);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { senderId } = req.params;
  const sender = await ShowSenderService(senderId);
  return res.status(200).json(sender);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const sender = await CreateSenderService(req.body);
  return res.status(201).json(sender);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { senderId } = req.params;
  const sender = await UpdateSenderService({ senderId, ...req.body });
  return res.status(200).json(sender);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { senderId } = req.params;
  await DeleteSenderService(senderId);
  return res.status(200).json({ message: "Sender deleted" });
};
