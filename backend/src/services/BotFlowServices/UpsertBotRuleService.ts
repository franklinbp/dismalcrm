import AppError from "../../errors/AppError";
import BotFlow from "../../models/BotFlow";
import BotRule, { BotRuleOperand } from "../../models/BotRule";
import { validateJsonField } from "./BotMasterRuleUtils";

interface Request {
  flowId: string | number;
  ruleId?: string | number;
  companyId: number;
  data: {
    name?: string;
    active?: boolean;
    priority?: number;
    operand?: BotRuleOperand;
    keyword?: string;
    responseText?: string;
    attachmentsJson?: string;
    buttonsJson?: string;
    catalogJson?: string;
    actionsJson?: string;
    nextStepJson?: string;
  };
}

const UpsertBotRuleService = async ({
  flowId,
  ruleId,
  companyId,
  data
}: Request): Promise<BotRule> => {
  const flow = await BotFlow.findOne({
    where: { id: flowId, companyId }
  });

  if (!flow) {
    throw new AppError("Flujo bot no encontrado", 404);
  }

  if (flow.runtimeEnabled) {
    throw new AppError(
      "Retira el flujo de produccion antes de modificar sus reglas",
      409
    );
  }

  try {
    validateJsonField(data.attachmentsJson);
    validateJsonField(data.buttonsJson);
    validateJsonField(data.catalogJson);
    validateJsonField(data.actionsJson);
    validateJsonField(data.nextStepJson);
  } catch (err) {
    throw new AppError("La configuracion JSON de la regla no es valida", 400);
  }

  if (ruleId) {
    const rule = await BotRule.findOne({
      where: { id: ruleId, flowId: flow.id, companyId }
    });

    if (!rule) {
      throw new AppError("Regla BotMaster no encontrada", 404);
    }

    await rule.update({
      name: data.name ?? rule.name,
      active: data.active ?? rule.active,
      priority: data.priority ?? rule.priority,
      operand: data.operand ?? rule.operand,
      keyword: data.keyword ?? rule.keyword,
      responseText: data.responseText ?? rule.responseText,
      attachmentsJson: data.attachmentsJson ?? rule.attachmentsJson,
      buttonsJson: data.buttonsJson ?? rule.buttonsJson,
      catalogJson: data.catalogJson ?? rule.catalogJson,
      actionsJson: data.actionsJson ?? rule.actionsJson,
      nextStepJson: data.nextStepJson ?? rule.nextStepJson
    });

    return rule;
  }

  const rule = await BotRule.create({
    flowId: flow.id,
    companyId,
    name: data.name || "Nueva regla BotMaster",
    active: data.active ?? true,
    priority: data.priority ?? 100,
    operand: data.operand || "CONTAINS",
    keyword: data.keyword || "",
    responseText: data.responseText || "Escribe aqui la respuesta de la regla.",
    attachmentsJson: data.attachmentsJson || "[]",
    buttonsJson: data.buttonsJson || "[]",
    catalogJson: data.catalogJson || "[]",
    actionsJson: data.actionsJson || "[]",
    nextStepJson: data.nextStepJson || "{}"
  });

  return rule;
};

export default UpsertBotRuleService;
