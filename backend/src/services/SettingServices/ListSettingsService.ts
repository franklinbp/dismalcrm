import Setting from "../../models/Setting";
import EnsureDefaultSettingsService from "./EnsureDefaultSettingsService";

const ListSettingsService = async (): Promise<Setting[] | undefined> => {
  await EnsureDefaultSettingsService();
  const settings = await Setting.findAll();

  return settings;
};

export default ListSettingsService;
