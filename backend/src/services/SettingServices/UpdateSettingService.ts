import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";
import EnsureDefaultSettingsService from "./EnsureDefaultSettingsService";

interface Request {
  key: string;
  value: string;
}

const UpdateSettingService = async ({
  key,
  value
}: Request): Promise<Setting | undefined> => {
  await EnsureDefaultSettingsService();

  const setting = await Setting.findOne({
    where: { key }
  });

  if (!setting) {
    if (!key) {
      throw new AppError("ERR_NO_SETTING_FOUND", 404);
    }

    const created = await Setting.create({ key, value });
    return created;
  }

  await setting.update({ value });

  return setting;
};

export default UpdateSettingService;
