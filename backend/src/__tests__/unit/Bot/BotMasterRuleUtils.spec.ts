import BotRule from "../../../models/BotRule";
import {
  botRuleMatches,
  findMatchingBotRule
} from "../../../services/BotFlowServices/BotMasterRuleUtils";

const rule = (operand: BotRule["operand"], keyword: string, id = 1): BotRule =>
  ({ id, operand, keyword } as BotRule);

describe("BotMasterRuleUtils", () => {
  it("normalizes accents and matches comma-separated keywords", () => {
    expect(
      botRuleMatches(
        rule("CONTAINS", "catalogo, office 365"),
        "Hola, necesito el CATALOGO actualizado"
      )
    ).toBe(true);
  });

  it("supports exact and boundary operands", () => {
    expect(botRuleMatches(rule("EQUALS", "asesor"), "Asesor")).toBe(true);
    expect(
      botRuleMatches(rule("STARTS_WITH", "precio"), "Precios Office")
    ).toBe(true);
    expect(
      botRuleMatches(rule("ENDS_WITH", "humano"), "Quiero un humano")
    ).toBe(true);
  });

  it("fails closed when a regular expression is invalid", () => {
    expect(botRuleMatches(rule("REGEX", "["), "cualquier mensaje")).toBe(false);
  });

  it("returns the first matching rule to preserve configured priority", () => {
    const first = rule("CONTAINS", "office", 10);
    const second = rule("CONTAINS", "office 365", 20);

    expect(findMatchingBotRule([first, second], "Office 365")).toBe(first);
  });
});
