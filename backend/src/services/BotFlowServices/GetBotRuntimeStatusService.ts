import { Op } from "sequelize";

import BotExecution from "../../models/BotExecution";
import BotFlow from "../../models/BotFlow";

interface Request {
  companyId: number;
}

const GetBotRuntimeStatusService = async ({ companyId }: Request) => {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [readyFlows, publishedFlows, recentFailures, recentReplies] =
    await Promise.all([
      BotFlow.count({ where: { companyId, active: true } }),
      BotFlow.count({
        where: { companyId, active: true, runtimeEnabled: true }
      }),
      BotExecution.count({
        where: {
          companyId,
          status: "FAILED",
          createdAt: { [Op.gte]: since }
        }
      }),
      BotExecution.count({
        where: {
          companyId,
          status: { [Op.in]: ["REPLIED", "HANDOFF"] },
          createdAt: { [Op.gte]: since }
        }
      })
    ]);

  return {
    serverEnabled: process.env.BOT_RUNTIME_ENABLED === "true",
    readyFlows,
    publishedFlows,
    recentFailures,
    recentReplies,
    checkedAt: new Date().toISOString()
  };
};

export default GetBotRuntimeStatusService;
