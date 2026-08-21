import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";
import { handleMessage } from "../services/FacebookServices/facebookMessageListener";
import { logger } from "../utils/logger";
import Setting from "../models/Setting";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const metaVerifyToken = await Setting.findOne({
    where: { key: "metaVerifyToken" }
  });
  const VERIFY_TOKEN =
    metaVerifyToken?.value ||
    process.env.META_VERIFY_TOKEN ||
    process.env.VERIFY_TOKEN ||
    "whaticket";

  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
  }

  return res.status(403).json({
    message: "Forbidden"
  });
};

export const webHook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { body } = req;

    if (body.object !== "page" && body.object !== "instagram") {
      return res.status(404).json({
        message: body
      });
    }

    const channel = body.object === "page" ? "facebook" : "instagram";
    const entries = Array.isArray(body.entry) ? body.entry : [];

    await Promise.all(
      entries.map(async (entry: any) => {
        const metaAccount = await Whatsapp.findOne({
          where: {
            facebookPageUserId: entry.id,
            channel
          }
        });

        if (!metaAccount) {
          logger.warn(
            `Meta webhook received for unmapped ${channel} account ${entry.id}`
          );
          return;
        }

        const messaging = Array.isArray(entry.messaging) ? entry.messaging : [];
        await Promise.all(
          messaging.map((data: any) =>
            handleMessage(metaAccount, data, channel, metaAccount.companyId)
          )
        );
      })
    );

    return res.status(200).json({
      message: "EVENT_RECEIVED"
    });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({
      message: "ERR_PROCESSING_META_WEBHOOK"
    });
  }
};
