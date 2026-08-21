import * as Yup from "yup";
import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import ListQuickAnswerService from "../services/QuickAnswerService/ListQuickAnswerService";
import CreateQuickAnswerService from "../services/QuickAnswerService/CreateQuickAnswerService";
import ShowQuickAnswerService from "../services/QuickAnswerService/ShowQuickAnswerService";
import UpdateQuickAnswerService from "../services/QuickAnswerService/UpdateQuickAnswerService";
import DeleteQuickAnswerService from "../services/QuickAnswerService/DeleteQuickAnswerService";
import SendQuickAnswerService from "../services/QuickAnswerService/SendQuickAnswerService";

import AppError from "../errors/AppError";
import fs from "fs";
import path from "path";
import uploadConfig from "../config/upload";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

interface QuickAnswerData {
  shortcut: string;
  message?: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { quickAnswers, count, hasMore } = await ListQuickAnswerService({
    searchParam,
    pageNumber
  });

  return res.json({ quickAnswers, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newQuickAnswer: QuickAnswerData = req.body;
  const media = req.file as Express.Multer.File | undefined;

  const QuickAnswerSchema = Yup.object().shape({
    shortcut: Yup.string().required()
  });

  try {
    await QuickAnswerSchema.validate(newQuickAnswer);
  } catch (err) {
    throw new AppError(err.message);
  }

  if (!newQuickAnswer.message && !media) {
    throw new AppError("Message or media is required");
  }

  const quickAnswer = await CreateQuickAnswerService({
    ...newQuickAnswer,
    message: newQuickAnswer.message || undefined,
    mediaUrl: media?.filename,
    mediaType: media?.mimetype,
    mediaName: media?.originalname
  });

  const io = getIO();
  io.emit("quickAnswer", {
    action: "create",
    quickAnswer
  });

  return res.status(200).json(quickAnswer);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { quickAnswerId } = req.params;

  const quickAnswer = await ShowQuickAnswerService(quickAnswerId);

  return res.status(200).json(quickAnswer);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const quickAnswerData: QuickAnswerData = req.body;
  const media = req.file as Express.Multer.File | undefined;
  const removeMedia = String(req.body?.removeMedia || "false") === "true";

  const schema = Yup.object().shape({
    shortcut: Yup.string(),
    message: Yup.string()
  });

  try {
    await schema.validate(quickAnswerData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const { quickAnswerId } = req.params;

  const existing = await ShowQuickAnswerService(quickAnswerId);

  const finalMessage =
    quickAnswerData.message !== undefined ? quickAnswerData.message : existing.message;
  const willHaveMedia = removeMedia ? false : Boolean(media || existing.mediaUrl);

  if (!finalMessage && !willHaveMedia) {
    throw new AppError("Message or media is required");
  }

  if (removeMedia && existing.mediaUrl) {
    const oldPath = path.join(uploadConfig.directory, existing.mediaUrl);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  if (media && existing.mediaUrl) {
    const oldPath = path.join(uploadConfig.directory, existing.mediaUrl);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const quickAnswer = await UpdateQuickAnswerService({
    quickAnswerData: {
      ...quickAnswerData,
      message:
        quickAnswerData.message !== undefined ? quickAnswerData.message : existing.message,
      mediaUrl: removeMedia ? null : media?.filename || existing.mediaUrl || null,
      mediaType: removeMedia ? null : media?.mimetype || existing.mediaType || null,
      mediaName: removeMedia ? null : media?.originalname || existing.mediaName || null
    },
    quickAnswerId
  });

  const io = getIO();
  io.emit("quickAnswer", {
    action: "update",
    quickAnswer
  });

  return res.status(200).json(quickAnswer);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { quickAnswerId } = req.params;

  const existing = await ShowQuickAnswerService(quickAnswerId);
  await DeleteQuickAnswerService(quickAnswerId);
  if (existing.mediaUrl) {
    const oldPath = path.join(uploadConfig.directory, existing.mediaUrl);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  const io = getIO();
  io.emit("quickAnswer", {
    action: "delete",
    quickAnswerId
  });

  return res.status(200).json({ message: "Quick Answer deleted" });
};

export const send = async (req: Request, res: Response): Promise<Response> => {
  const { quickAnswerId } = req.params;
  const { ticketId, message } = req.body;

  if (!ticketId) {
    throw new AppError("ticketId is required", 400);
  }

  await SendQuickAnswerService({ quickAnswerId, ticketId, messageOverride: message });

  return res.status(200).json({ message: "Quick Answer sent" });
};
