import BotConnection from "../../models/BotConnection";
import BotFlow from "../../models/BotFlow";
import BotNode from "../../models/BotNode";
import BotRule from "../../models/BotRule";

interface Request {
  companyId: number;
}

const ListBotFlowsService = async ({
  companyId
}: Request): Promise<BotFlow[]> => {
  const flows = await BotFlow.findAll({
    where: { companyId },
    include: [{ model: BotNode }, { model: BotRule }, { model: BotConnection }],
    order: [
      ["priority", "ASC"],
      ["id", "ASC"]
    ]
  });

  flows.forEach(flow => {
    if (flow.nodes) {
      flow.nodes = [...flow.nodes].sort((a, b) => {
        if (a.positionY === b.positionY) return a.positionX - b.positionX;
        return a.positionY - b.positionY;
      });
    }
  });

  return flows;
};

export default ListBotFlowsService;
