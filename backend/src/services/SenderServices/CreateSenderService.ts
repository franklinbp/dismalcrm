import * as Yup from "yup";
import Sender from "../../models/Sender";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

interface Request {
  name: string;
  phone: string;
  whatsappId: number;
  status?: "online" | "offline";
  ratePerMin?: number | null;
}

const CreateSenderService = async (data: Request): Promise<Sender> => {
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    phone: Yup.string().required(),
    whatsappId: Yup.number().required(),
    status: Yup.string().oneOf(["online", "offline"]).nullable(),
    ratePerMin: Yup.number().nullable()
  });

  try {
    await schema.validate(data);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const whatsapp = await Whatsapp.findByPk(data.whatsappId);
  if (!whatsapp) {
    throw new AppError("WhatsApp not found", 404);
  }

  const sender = await Sender.create({
    name: data.name,
    phone: data.phone,
    whatsappId: data.whatsappId,
    status: data.status || "offline",
    ratePerMin: data.ratePerMin || null
  });

  return sender;
};

export default CreateSenderService;
