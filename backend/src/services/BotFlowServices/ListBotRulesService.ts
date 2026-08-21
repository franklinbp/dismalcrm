import BotRule from "../../models/BotRule";

interface Request {
  flowId: string | number;
  companyId: number;
}

const ListBotRulesService = async ({
  flowId,
  companyId
}: Request): Promise<BotRule[]> => {
  const rules = await BotRule.findAll({
    where: { flowId, companyId },
    order: [
      ["priority", "ASC"],
      ["id", "ASC"]
    ]
  });

  return rules;
};

export default ListBotRulesService;
