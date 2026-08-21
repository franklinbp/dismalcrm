import { Op } from "sequelize";

import BotExecution from "../../models/BotExecution";
import BotFlow from "../../models/BotFlow";
import BotRule from "../../models/BotRule";

interface Request {
  companyId: number;
  limit?: number;
}

const ListBotExecutionsService = async ({
  companyId,
  limit = 20
}: Request): Promise<BotExecution[]> => {
  const safeLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return BotExecution.findAll({
    where: {
      companyId,
      channel: "whatsapp",
      status: {
        [Op.in]: ["PROCESSING", "REPLIED", "NO_MATCH", "FAILED", "HANDOFF"]
      }
    },
    include: [
      { model: BotFlow, attributes: ["id", "name", "channel"] },
      { model: BotRule, attributes: ["id", "name"] }
    ],
    order: [["createdAt", "DESC"]],
    limit: safeLimit
  });
};

export default ListBotExecutionsService;
