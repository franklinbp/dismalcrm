import { Request, Response } from "express";
import * as Yup from "yup";

import AppError from "../errors/AppError";
import SendGatewayTextService from "../services/GatewayServices/SendGatewayTextService";
import { logger } from "../utils/logger";

interface GatewayMessageBody {
  number?: unknown;
  body?: unknown;
  whatsappId?: unknown;
}

const maskPhone = (number: string): string =>
  number.length > 4
    ? `${"*".repeat(number.length - 4)}${number.slice(-4)}`
    : "****";

export const send = async (req: Request, res: Response): Promise<Response> => {
  const payload = (req.body || {}) as GatewayMessageBody;
  const number = String(payload.number || "").replace(/\D/g, "");
  const body = typeof payload.body === "string" ? payload.body.trim() : "";
  const whatsappId =
    payload.whatsappId === undefined ||
    payload.whatsappId === null ||
    payload.whatsappId === ""
      ? null
      : Number(payload.whatsappId);

  const schema = Yup.object().shape({
    number: Yup.string()
      .required("number is required")
      .matches(/^\d+$/, "Invalid number format. Only numbers are allowed."),
    body: Yup.string().required("body is required"),
    whatsappId: Yup.number()
      .integer("whatsappId must be an integer")
      .positive("whatsappId must be positive")
      .nullable()
  });

  try {
    await schema.validate({ number, body, whatsappId }, { abortEarly: false });
  } catch (err: any) {
    throw new AppError(err.errors?.join("; ") || err.message, 400);
  }

  const result = await SendGatewayTextService({
    whatsappId,
    number,
    body
  });

  logger.info(
    {
      whatsappId: result.whatsappId,
      number: maskPhone(number)
    },
    "Gateway WhatsApp notification sent without ticket"
  );

  return res.status(200).json({ status: "sent" });
};
