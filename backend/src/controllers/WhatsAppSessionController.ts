import { Request, Response } from "express";
import { getWbot } from "../libs/wbot";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";
import { getIO } from "../libs/socket";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  // Innovación: Notificar al frontend que el proceso de apertura ha comenzado
  getIO().emit("whatsapp", {
    action: "update",
    whatsapp: { ...whatsapp.toJSON(), status: "OPENING" }
  });

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" }
  });

  // Innovación: Notificar al frontend que el proceso de actualización ha comenzado
  getIO().emit("whatsapp", {
    action: "update",
    whatsapp: { ...whatsapp.toJSON(), status: "OPENING" }
  });

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  try {
    const wbot = getWbot(whatsapp.id);
    await wbot.logout();
  } catch (err) {
    // Si no hay bot activo, simplemente no hacemos nada
  }

  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove, update };
