import AppError from "../../errors/AppError";
import BotFlow from "../../models/BotFlow";
import BotNode, { BotNodeType } from "../../models/BotNode";

interface Request {
  nodeId: string | number;
  companyId: number;
  data: {
    type?: BotNodeType;
    title?: string;
    positionX?: number;
    positionY?: number;
    configJson?: string;
  };
}

const UpdateBotNodeService = async ({
  nodeId,
  companyId,
  data
}: Request): Promise<BotNode> => {
  const node = await BotNode.findOne({
    where: { id: nodeId, companyId }
  });

  if (!node) {
    throw new AppError("Nodo bot no encontrado", 404);
  }

  const flow = await BotFlow.findOne({
    where: { id: node.flowId, companyId }
  });
  if (flow?.runtimeEnabled) {
    throw new AppError(
      "Retira el flujo de produccion antes de modificar sus nodos",
      409
    );
  }

  if (data.configJson) {
    try {
      JSON.parse(data.configJson);
    } catch (err) {
      throw new AppError("La configuracion del nodo no es JSON valido", 400);
    }
  }

  await node.update({
    type: data.type ?? node.type,
    title: data.title ?? node.title,
    positionX: data.positionX ?? node.positionX,
    positionY: data.positionY ?? node.positionY,
    configJson: data.configJson ?? node.configJson
  });

  return node;
};

export default UpdateBotNodeService;
