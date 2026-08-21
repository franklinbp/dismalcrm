import AppError from "../../errors/AppError";
import QuickAnswer from "../../models/QuickAnswer";

interface Request {
  shortcut: string;
  message?: string;
  mediaUrl?: string;
  mediaType?: string;
  mediaName?: string;
}

const CreateQuickAnswerService = async ({
  shortcut,
  message,
  mediaUrl,
  mediaType,
  mediaName
}: Request): Promise<QuickAnswer> => {
  const nameExists = await QuickAnswer.findOne({
    where: { shortcut }
  });

  if (nameExists) {
    throw new AppError("ERR__SHORTCUT_DUPLICATED");
  }

  const quickAnswer = await QuickAnswer.create({
    shortcut,
    message: message || null,
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || null,
    mediaName: mediaName || null
  });

  return quickAnswer;
};

export default CreateQuickAnswerService;
