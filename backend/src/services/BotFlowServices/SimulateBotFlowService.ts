import AppError from "../../errors/AppError";
import BotConnection from "../../models/BotConnection";
import BotExecution from "../../models/BotExecution";
import BotFlow from "../../models/BotFlow";
import BotNode from "../../models/BotNode";

interface Request {
  flowId: string | number;
  companyId: number;
  messageBody: string;
  contactName?: string;
  channel?: string;
}

interface ParsedConfig {
  keywords?: string[];
  response?: string;
  buttons?: Array<{ id?: string; title?: string }>;
  attachments?: Array<{ type?: string; title?: string; source?: string }>;
  actions?: string[];
  [key: string]: unknown;
}

const parseConfig = (configJson?: string): ParsedConfig => {
  if (!configJson) return {};

  try {
    return JSON.parse(configJson);
  } catch (err) {
    return {};
  }
};

const normalize = (value?: string): string =>
  (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const applyVariables = (template: string, contactName?: string): string =>
  template.replace(/\{nombre\}/g, contactName || "cliente");

const getNodeScore = (node: BotNode, message: string): number => {
  const config = parseConfig(node.configJson);
  const keywords = config.keywords || [];

  return keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalize(keyword);
    if (!normalizedKeyword) return score;
    return message.includes(normalizedKeyword)
      ? score + normalizedKeyword.length
      : score;
  }, 0);
};

const buildReply = (node: BotNode, contactName?: string): string => {
  const config = parseConfig(node.configJson);
  const response =
    config.response ||
    "Gracias por escribirnos. Un asesor puede continuar con tu solicitud.";

  const buttons = config.buttons || [];
  const attachments = config.attachments || [];

  const buttonText = buttons.length
    ? `\n\nOpciones:\n${buttons
        .map((button, index) => `${index + 1}. ${button.title || button.id}`)
        .join("\n")}`
    : "";

  const attachmentText = attachments.length
    ? `\n\nAdjuntos sugeridos:\n${attachments
        .map(attachment => `- ${attachment.title || attachment.source}`)
        .join("\n")}`
    : "";

  return `${applyVariables(
    response,
    contactName
  )}${buttonText}${attachmentText}`;
};

const buildTimeline = (
  nodes: BotNode[],
  connections: BotConnection[],
  targetNode: BotNode
): string[] => {
  const start = nodes.find(node => node.type === "START");
  const timeline: BotNode[] = [];

  if (start) timeline.push(start);

  const intent = nodes.find(node => node.type === "INTENT");
  if (intent && intent.id !== start?.id && targetNode.id !== start?.id) {
    timeline.push(intent);
  }

  if (!timeline.some(node => node.id === targetNode.id)) {
    const directParent = connections.find(
      connection => connection.targetNodeId === targetNode.id
    );
    const parent = nodes.find(node => node.id === directParent?.sourceNodeId);

    if (parent && !timeline.some(node => node.id === parent.id)) {
      timeline.push(parent);
    }

    timeline.push(targetNode);
  }

  return timeline.map(node => node.title);
};

const SimulateBotFlowService = async ({
  flowId,
  companyId,
  messageBody,
  contactName,
  channel = "simulator"
}: Request): Promise<Record<string, unknown>> => {
  const flow = await BotFlow.findOne({
    where: { id: flowId, companyId },
    include: [{ model: BotNode }, { model: BotConnection }]
  });

  if (!flow) {
    throw new AppError("Flujo bot no encontrado", 404);
  }

  const nodes = [...(flow.nodes || [])];
  const connections = [...(flow.connections || [])];

  if (!nodes.length) {
    throw new AppError("El flujo no tiene nodos configurados", 400);
  }

  const normalizedMessage = normalize(messageBody);
  const scoredNodes = nodes
    .filter(node => node.type !== "START" && node.type !== "INTENT")
    .map(node => ({ node, score: getNodeScore(node, normalizedMessage) }))
    .sort((a, b) => b.score - a.score);

  const selectedNode =
    scoredNodes.find(item => item.score > 0)?.node ||
    nodes.find(node => node.type === "MENU") ||
    nodes.find(node => node.type === "HUMAN_HANDOFF") ||
    nodes[0];

  const config = parseConfig(selectedNode.configJson);
  const reply = buildReply(selectedNode, contactName);
  const timeline = buildTimeline(nodes, connections, selectedNode);
  const actions = config.actions || [];

  const execution = await BotExecution.create({
    flowId: flow.id,
    companyId,
    currentNodeId: selectedNode.id,
    status: "SIMULATED",
    channel,
    lastInput: messageBody,
    lastOutput: reply,
    metadataJson: JSON.stringify({
      contactName,
      selectedNodeId: selectedNode.id,
      selectedNodeTitle: selectedNode.title,
      actions,
      timeline
    })
  });

  return {
    flow,
    matchedNode: selectedNode,
    reply,
    actions,
    timeline,
    execution
  };
};

export default SimulateBotFlowService;
