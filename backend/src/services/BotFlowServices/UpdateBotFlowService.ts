import fs from "fs";
import path from "path";
import { Op } from "sequelize";

import uploadConfig from "../../config/upload";
import AppError from "../../errors/AppError";
import BotConnection from "../../models/BotConnection";
import BotFlow from "../../models/BotFlow";
import BotNode from "../../models/BotNode";
import BotRule from "../../models/BotRule";

interface Request {
  flowId: string | number;
  companyId: number;
  data: {
    name?: string;
    description?: string;
    channel?: string;
    active?: boolean;
    runtimeEnabled?: boolean;
    priority?: number;
  };
}

interface AttachmentConfig {
  source?: string;
  title?: string;
}

const validateRuleForProduction = (rule: BotRule): void => {
  if (!rule.keyword?.trim()) {
    throw new AppError(`La regla "${rule.name}" no tiene palabras clave`, 400);
  }
  if (rule.operand === "REGEX") {
    try {
      new RegExp(rule.keyword, "i");
    } catch (_err) {
      throw new AppError(
        `La expresion regular de "${rule.name}" no es valida`,
        400
      );
    }
  }

  let attachments: AttachmentConfig[];
  let buttons: unknown[];
  let catalog: unknown[];
  try {
    attachments = JSON.parse(rule.attachmentsJson || "[]");
    buttons = JSON.parse(rule.buttonsJson || "[]");
    catalog = JSON.parse(rule.catalogJson || "[]");
    const actions = JSON.parse(rule.actionsJson || "[]");
    const nextStep = JSON.parse(rule.nextStepJson || "{}");
    if (
      !Array.isArray(attachments) ||
      !Array.isArray(buttons) ||
      !Array.isArray(catalog) ||
      !Array.isArray(actions) ||
      !attachments.every(
        attachment => attachment && typeof attachment === "object"
      ) ||
      !buttons.every(button => button && typeof button === "object") ||
      !catalog.every(section => section && typeof section === "object") ||
      !actions.every(action => typeof action === "string") ||
      !nextStep ||
      Array.isArray(nextStep) ||
      typeof nextStep !== "object"
    ) {
      throw new Error("Invalid BotMaster payload shape");
    }
  } catch (_err) {
    throw new AppError(
      `La configuracion JSON de "${rule.name}" no es valida`,
      400
    );
  }

  if (
    !rule.responseText?.trim() &&
    !attachments.length &&
    !buttons.length &&
    !catalog.length
  ) {
    throw new AppError(`La regla "${rule.name}" no tiene respuesta`, 400);
  }

  const uploadRoot = path.resolve(uploadConfig.directory);
  attachments.forEach(attachment => {
    if (
      typeof attachment.source !== "string" ||
      !attachment.source ||
      /^https?:\/\//i.test(attachment.source)
    ) {
      throw new AppError(
        `El adjunto de "${rule.name}" debe ser un archivo local`,
        400
      );
    }

    const filePath = path.resolve(uploadRoot, attachment.source);
    const insideUploadRoot =
      filePath === uploadRoot ||
      filePath.startsWith(`${uploadRoot}${path.sep}`);
    if (
      !insideUploadRoot ||
      !fs.existsSync(filePath) ||
      !fs.statSync(filePath).isFile()
    ) {
      throw new AppError(
        `No existe el adjunto "${attachment.source}" de la regla "${rule.name}"`,
        400
      );
    }
  });
};

const UpdateBotFlowService = async ({
  flowId,
  companyId,
  data
}: Request): Promise<BotFlow> => {
  const flow = await BotFlow.findOne({
    where: { id: flowId, companyId }
  });

  if (!flow) {
    throw new AppError("Flujo bot no encontrado", 404);
  }

  const nextActive = data.active ?? flow.active;
  const nextChannel = data.channel ?? flow.channel;
  const nextRuntimeEnabled = nextActive
    ? data.runtimeEnabled ?? flow.runtimeEnabled
    : false;

  if (nextRuntimeEnabled && process.env.BOT_RUNTIME_ENABLED !== "true") {
    throw new AppError(
      "El motor de produccion esta deshabilitado en el servidor",
      409
    );
  }

  if (nextRuntimeEnabled) {
    const activeRules = await BotRule.findAll({
      where: { flowId: flow.id, companyId, active: true }
    });

    if (!activeRules.length) {
      throw new AppError(
        "El flujo necesita al menos una regla activa antes de publicarse",
        400
      );
    }

    activeRules.forEach(validateRuleForProduction);

    const competingFlow = await BotFlow.findOne({
      where: {
        id: { [Op.ne]: flow.id },
        companyId,
        active: true,
        runtimeEnabled: true,
        channel:
          nextChannel === "all"
            ? { [Op.in]: ["all", "whatsapp"] }
            : { [Op.in]: ["all", nextChannel] }
      }
    });
    if (competingFlow) {
      throw new AppError(
        `Retira de produccion el flujo "${competingFlow.name}" antes de publicar este canal`,
        409
      );
    }
  }

  await flow.update({
    name: data.name ?? flow.name,
    description: data.description ?? flow.description,
    channel: nextChannel,
    active: nextActive,
    runtimeEnabled: nextRuntimeEnabled,
    priority: data.priority ?? flow.priority
  });

  await flow.reload({
    include: [{ model: BotNode }, { model: BotConnection }]
  });

  return flow;
};

export default UpdateBotFlowService;
