import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";
import EnsureWhatsappCompanyService from "../WhatsappService/EnsureWhatsappCompanyService";

const startingSessions = new Set<number>();

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  if (startingSessions.has(whatsapp.id)) {
    return;
  }

  startingSessions.add(whatsapp.id);
  let sessionWhatsapp = whatsapp;

  try {
    sessionWhatsapp = await EnsureWhatsappCompanyService(whatsapp);
    await sessionWhatsapp.update({ status: "OPENING" });

    const io = getIO();
    io.emit("whatsappSession", {
      action: "update",
      session: sessionWhatsapp
    });

    const wbot = await initWbot(sessionWhatsapp);
    wbotMessageListener(wbot);
    wbotMonitor(wbot, sessionWhatsapp);
  } catch (err) {
    logger.error(err);
    await sessionWhatsapp.update({ status: "DISCONNECTED", qrcode: "" });
  } finally {
    startingSessions.delete(whatsapp.id);
  }
};
