import AppError from "../../errors/AppError";
import BotFlow from "../../models/BotFlow";
import BotNode, { BotNodeType } from "../../models/BotNode";

interface Request {
  flowId: string | number;
  companyId: number;
  data: {
    type?: BotNodeType;
    title?: string;
    positionX?: number;
    positionY?: number;
    configJson?: string;
  };
}

const CreateBotNodeService = async ({
  flowId,
  companyId,
  data
}: Request): Promise<BotNode> => {
  const flow = await BotFlow.findOne({
    where: { id: flowId, companyId }
  });

  if (!flow) {
    throw new AppError("Flujo bot no encontrado", 404);
  }

  if (flow.runtimeEnabled) {
    throw new AppError(
      "Retira el flujo de produccion antes de agregar nodos",
      409
    );
  }

  const node = await BotNode.create({
    flowId: flow.id,
    companyId,
    type: data.type || "RESPONSE",
    title: data.title || "Nueva respuesta",
    positionX: data.positionX ?? 520,
    positionY: data.positionY ?? 420,
    configJson:
      data.configJson ||
      JSON.stringify(
        {
          keywords: [],
          response: "Escribe aqui la respuesta del bot.",
          buttons: [],
          attachments: [],
          actions: []
        },
        null,
        2
      )
  });

  return node;
};

export default CreateBotNodeService;
