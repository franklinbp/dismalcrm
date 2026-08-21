import Sender from "../../models/Sender";
import AppError from "../../errors/AppError";

const DeleteSenderService = async (senderId: number | string): Promise<void> => {
  const sender = await Sender.findByPk(senderId);
  if (!sender) {
    throw new AppError("Sender not found", 404);
  }
  await sender.destroy();
};

export default DeleteSenderService;
