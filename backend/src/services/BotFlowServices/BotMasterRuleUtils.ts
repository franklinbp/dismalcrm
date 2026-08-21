import BotRule from "../../models/BotRule";

export interface ParsedBotRulePayload {
  attachments: unknown[];
  buttons: unknown[];
  catalog: unknown[];
  actions: string[];
  nextStep: Record<string, unknown>;
}

export const parseJsonValue = <T>(
  value: string | null | undefined,
  fallback: T
): T => {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch (err) {
    return fallback;
  }
};

export const normalizeRuleText = (value?: string): string =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const splitKeywords = (keyword: string): string[] =>
  keyword
    .split(",")
    .map(item => normalizeRuleText(item))
    .filter(Boolean);

export const botRuleMatches = (rule: BotRule, messageBody: string): boolean => {
  const message = normalizeRuleText(messageBody);
  if (!message) return false;

  if (rule.operand === "REGEX") {
    try {
      return new RegExp(rule.keyword, "i").test(messageBody);
    } catch (_err) {
      return false;
    }
  }

  const keywords = splitKeywords(rule.keyword);
  return keywords.some(keyword => {
    if (rule.operand === "EQUALS") return message === keyword;
    if (rule.operand === "STARTS_WITH") return message.startsWith(keyword);
    if (rule.operand === "ENDS_WITH") return message.endsWith(keyword);
    return message.includes(keyword);
  });
};

export const findMatchingBotRule = (
  rules: BotRule[],
  messageBody: string
): BotRule | undefined => rules.find(rule => botRuleMatches(rule, messageBody));

export const applyRuleVariables = (
  template: string,
  variables: Record<string, string | undefined>
): string =>
  Object.keys(variables).reduce((result, key) => {
    const value = variables[key] || "";
    return result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  }, template);

export const parseRulePayload = (rule: BotRule): ParsedBotRulePayload => ({
  attachments: parseJsonValue(rule.attachmentsJson, []),
  buttons: parseJsonValue(rule.buttonsJson, []),
  catalog: parseJsonValue(rule.catalogJson, []),
  actions: parseJsonValue(rule.actionsJson, []),
  nextStep: parseJsonValue(rule.nextStepJson, {})
});

export const validateJsonField = (value: string | undefined): void => {
  if (!value) return;
  JSON.parse(value);
};
