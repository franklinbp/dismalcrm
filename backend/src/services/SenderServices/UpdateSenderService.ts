import * as Yup from "yup";
import Sender from "../../models/Sender";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

interface Request {
  senderId: number | string;
  name?: string;
  phone?: string;
  whatsappId?: number;
  status?: "online" | "offline";
  ratePerMin?: number | null;
}

const UpdateSenderService = async (data: Request): Promise<Sender> => {
  const schema = Yup.object().shape({
    name: Yup.string(),
    phone: Yup.string(),
    whatsappId: Yup.number(),
    status: Yup.string().oneOf(["online", "offline"]).nullable(),
    ratePerMin: Yup.number().nullable()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const sender = await Sender.findByPk(data.senderId);
  if (!sender) {
    throw new AppError("Sender not found", 404);
  }

  if (data.whatsappId) {
    const whatsapp = await Whatsapp.findByPk(data.whatsappId);
    if (!whatsapp) {
      throw new AppError("WhatsApp not found", 404);
    }
  }

  await sender.update({
    name: data.name ?? sender.name,
    phone: data.phone ?? sender.phone,
    whatsappId: data.whatsappId ?? sender.whatsappId,
    status: data.status ?? sender.status,
    ratePerMin: data.ratePerMin !== undefined ? data.ratePerMin : sender.ratePerMin
  });

  return sender;
};

export default UpdateSenderService;
