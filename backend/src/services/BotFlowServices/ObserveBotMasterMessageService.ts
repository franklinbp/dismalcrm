import AppError from "../../errors/AppError";
import BotExecution from "../../models/BotExecution";
import BotFlow from "../../models/BotFlow";
import BotRule from "../../models/BotRule";
import {
  applyRuleVariables,
  findMatchingBotRule,
  parseRulePayload
} from "./BotMasterRuleUtils";

interface Request {
  flowId: string | number;
  companyId: number;
  messageBody: string;
  contactName?: string;
  channel?: string;
}

const ObserveBotMasterMessageService = async ({
  flowId,
  companyId,
  messageBody,
  contactName,
  channel = "observer"
}: Request): Promise<Record<string, unknown>> => {
  const flow = await BotFlow.findOne({
    where: { id: flowId, companyId }
  });

  if (!flow) {
    throw new AppError("Flujo bot no encontrado", 404);
  }

  const rules = await BotRule.findAll({
    where: { flowId: flow.id, companyId, active: true },
    order: [
      ["priority", "ASC"],
      ["id", "ASC"]
    ]
  });

  const matchedRule = findMatchingBotRule(rules, messageBody);

  const payload = matchedRule ? parseRulePayload(matchedRule) : null;
  const reply = matchedRule
    ? applyRuleVariables(matchedRule.responseText, {
        nombre: contactName || "cliente"
      })
    : "";

  const execution = await BotExecution.create({
    flowId: flow.id,
    companyId,
    status: "OBSERVED",
    channel,
    lastInput: messageBody,
    lastOutput: reply,
    metadataJson: JSON.stringify({
      mode: "BOTMASTER_OBSERVER",
      contactName,
      matched: Boolean(matchedRule),
      ruleId: matchedRule?.id || null,
      ruleName: matchedRule?.name || null,
      payload
    })
  });

  return {
    flow,
    matched: Boolean(matchedRule),
    rule: matchedRule,
    reply,
    payload,
    execution
  };
};

export default ObserveBotMasterMessageService;
