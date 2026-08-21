import { initWbot } from "../../libs/wbot";
import Whatsapp from "../../models/Whatsapp";
import { wbotMessageListener } from "./wbotMessageListener";
import { getIO } from "../../libs/socket";
import wbotMonitor from "./wbotMonitor";
import { logger } from "../../utils/logger";

const startingSessions = new Set<number>();

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp
): Promise<void> => {
  if (startingSessions.has(whatsapp.id)) {
    return;
  }

  startingSessions.add(whatsapp.id);

  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  try {
    const wbot = await initWbot(whatsapp);
    wbotMessageListener(wbot);
    wbotMonitor(wbot, whatsapp);
  } catch (err) {
    logger.error(err);
    await whatsapp.update({ status: "DISCONNECTED", qrcode: "" });
  } finally {
    startingSessions.delete(whatsapp.id);
  }
};
