import QuickAnswer from "../../models/QuickAnswer";
import AppError from "../../errors/AppError";

interface QuickAnswerData {
  shortcut?: string;
  message?: string;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaName?: string | null;
}

interface Request {
  quickAnswerData: QuickAnswerData;
  quickAnswerId: string;
}

const UpdateQuickAnswerService = async ({
  quickAnswerData,
  quickAnswerId
}: Request): Promise<QuickAnswer> => {
  const { shortcut, message, mediaUrl, mediaType, mediaName } = quickAnswerData;

  const quickAnswer = await QuickAnswer.findOne({
    where: { id: quickAnswerId }
  });

  if (!quickAnswer) {
    throw new AppError("ERR_NO_QUICK_ANSWERS_FOUND", 404);
  }
  await quickAnswer.update({
    shortcut,
    message,
    mediaUrl,
    mediaType,
    mediaName
  });

  await quickAnswer.reload();

  return quickAnswer;
};

export default UpdateQuickAnswerService;
