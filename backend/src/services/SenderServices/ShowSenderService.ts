import Sender from "../../models/Sender";
import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

const ShowSenderService = async (id: number | string): Promise<Sender> => {
  const sender = await Sender.findByPk(id, { include: [{ model: Whatsapp }] });
  if (!sender) {
    throw new AppError("Sender not found", 404);
  }
  return sender;
};

export default ShowSenderService;
