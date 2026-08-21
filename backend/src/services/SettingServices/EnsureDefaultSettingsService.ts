import Setting from "../../models/Setting";

const DEFAULT_SETTINGS: Array<{ key: string; value: string }> = [
  { key: "userCreation", value: "enabled" },
  { key: "autoReplyEnabled", value: "disabled" },
  { key: "autoReplyOncePerTicket", value: "enabled" },
  { key: "autoReplyRules", value: "" },
  { key: "autoReplyDefaultResponse", value: "" },
  { key: "metaVerifyToken", value: "" },
  { key: "metaAppId", value: "" },
  { key: "metaAppSecret", value: "" },
  { key: "metaGraphVersion", value: "v13.0" }
];

const EnsureDefaultSettingsService = async (): Promise<void> => {
  await Promise.all(
    DEFAULT_SETTINGS.map(async setting => {
      await Setting.findOrCreate({
        where: { key: setting.key },
        defaults: setting
      });
    })
  );
};

export default EnsureDefaultSettingsService;
