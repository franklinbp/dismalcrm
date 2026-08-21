import BotConnection from "../../models/BotConnection";
import BotFlow from "../../models/BotFlow";
import BotNode from "../../models/BotNode";

interface Request {
  companyId: number;
}

const nodeConfig = (value: Record<string, unknown>): string =>
  JSON.stringify(value, null, 2);

const loadFlow = async (flowId: number): Promise<BotFlow> => {
  const flow = await BotFlow.findByPk(flowId, {
    include: [{ model: BotNode }, { model: BotConnection }]
  });

  if (flow?.nodes) {
    flow.nodes = [...flow.nodes].sort((a, b) => {
      if (a.positionY === b.positionY) return a.positionX - b.positionX;
      return a.positionY - b.positionY;
    });
  }

  return flow as BotFlow;
};

const CreateDefaultBotFlowService = async ({
  companyId
}: Request): Promise<BotFlow> => {
  const existing = await BotFlow.findOne({
    where: { companyId, name: "Ventas productos digitales" }
  });

  if (existing) {
    return loadFlow(existing.id);
  }

  const flow = await BotFlow.create({
    name: "Ventas productos digitales",
    description:
      "Flujo base para clasificar consultas, mostrar menus, enviar catalogos y pasar a un asesor cuando sea necesario.",
    channel: "all",
    active: false,
    priority: 1,
    companyId
  });

  const start = await BotNode.create({
    flowId: flow.id,
    companyId,
    type: "START",
    title: "Mensaje entrante",
    positionX: 20,
    positionY: 160,
    configJson: nodeConfig({
      guard: ["no repetir si existe asesor activo", "no enviar en grupos"],
      response: "Analizar mensaje entrante y continuar al clasificador."
    })
  });

  const intent = await BotNode.create({
    flowId: flow.id,
    companyId,
    type: "INTENT",
    title: "Clasificar intencion",
    positionX: 260,
    positionY: 160,
    configJson: nodeConfig({
      keywords: [
        "office",
        "precio",
        "catalogo",
        "licencia",
        "activar",
        "mayorista"
      ],
      fallback: "Si no se reconoce la intencion, pasar al menu principal."
    })
  });

  const menu = await BotNode.create({
    flowId: flow.id,
    companyId,
    type: "MENU",
    title: "Menu comercial",
    positionX: 500,
    positionY: 60,
    configJson: nodeConfig({
      keywords: ["hola", "buenas", "info", "informacion"],
      response:
        "Hola {nombre}, soy el asistente de Dismal. Selecciona una opcion para ayudarte mas rapido.",
      buttons: [
        { id: "office365", title: "Office 365" },
        { id: "precios", title: "Lista de precios" },
        { id: "mayorista", title: "Precios mayoristas" },
        { id: "asesor", title: "Hablar con asesor" }
      ]
    })
  });

  const office = await BotNode.create({
    flowId: flow.id,
    companyId,
    type: "RESPONSE",
    title: "Office 365",
    positionX: 500,
    positionY: 260,
    configJson: nodeConfig({
      keywords: ["office", "365", "office365", "microsoft"],
      response:
        "Tenemos Office 365 con entrega inmediata. Incluye usuario, clave y soporte de activacion. Puedo enviarte opciones por precio, duracion o cantidad de equipos.",
      buttons: [
        { id: "cotizar-office", title: "Cotizar Office 365" },
        { id: "catalogo-office", title: "Enviar catalogo Office" }
      ],
      actions: ["Crear lead comercial", "Programar seguimiento"]
    })
  });

  const catalog = await BotNode.create({
    flowId: flow.id,
    companyId,
    type: "ACTION",
    title: "Enviar catalogo",
    positionX: 760,
    positionY: 160,
    configJson: nodeConfig({
      keywords: ["catalogo", "precios", "lista", "mayorista"],
      response:
        "Te comparto el catalogo actualizado. Tenemos licencias originales, entrega inmediata y soporte tecnico.",
      attachments: [
        {
          type: "pdf",
          title: "Catalogo Dismal",
          source: "catalogos/catalogo-general.pdf"
        }
      ],
      actions: ["Enviar catalogo", "Registrar interes"]
    })
  });

  const lead = await BotNode.create({
    flowId: flow.id,
    companyId,
    type: "ACTION",
    title: "Crear lead",
    positionX: 1020,
    positionY: 80,
    configJson: nodeConfig({
      response:
        "Registrar el contacto en Centro Comercial para seguimiento, tipo de cliente e interes.",
      actions: ["Crear lead comercial", "Asignar asesor"]
    })
  });

  const followUp = await BotNode.create({
    flowId: flow.id,
    companyId,
    type: "ACTION",
    title: "Seguimiento",
    positionX: 1020,
    positionY: 260,
    configJson: nodeConfig({
      response:
        "Programar una tarea de seguimiento si el cliente cotizo pero no compro.",
      actions: ["Programar seguimiento", "Enviar recordatorio"]
    })
  });

  const handoff = await BotNode.create({
    flowId: flow.id,
    companyId,
    type: "HUMAN_HANDOFF",
    title: "Asesor humano",
    positionX: 760,
    positionY: 360,
    configJson: nodeConfig({
      keywords: ["asesor", "humano", "ayuda", "soporte", "problema"],
      response:
        "Te paso con un asesor para revisar tu caso con mas detalle. Un momento por favor.",
      actions: ["Pausar bot", "Notificar asesor"]
    })
  });

  await BotConnection.bulkCreate([
    {
      flowId: flow.id,
      companyId,
      sourceNodeId: start.id,
      targetNodeId: intent.id,
      conditionJson: nodeConfig({ when: "mensaje_recibido" })
    },
    {
      flowId: flow.id,
      companyId,
      sourceNodeId: intent.id,
      targetNodeId: menu.id,
      conditionJson: nodeConfig({ when: "fallback_o_saludo" })
    },
    {
      flowId: flow.id,
      companyId,
      sourceNodeId: intent.id,
      targetNodeId: office.id,
      conditionJson: nodeConfig({ keywords: ["office", "365"] })
    },
    {
      flowId: flow.id,
      companyId,
      sourceNodeId: menu.id,
      targetNodeId: catalog.id,
      conditionJson: nodeConfig({ option: "precios" })
    },
    {
      flowId: flow.id,
      companyId,
      sourceNodeId: office.id,
      targetNodeId: catalog.id,
      conditionJson: nodeConfig({ option: "catalogo-office" })
    },
    {
      flowId: flow.id,
      companyId,
      sourceNodeId: catalog.id,
      targetNodeId: lead.id,
      conditionJson: nodeConfig({ after: "catalogo_enviado" })
    },
    {
      flowId: flow.id,
      companyId,
      sourceNodeId: lead.id,
      targetNodeId: followUp.id,
      conditionJson: nodeConfig({ if: "sin_compra" })
    },
    {
      flowId: flow.id,
      companyId,
      sourceNodeId: menu.id,
      targetNodeId: handoff.id,
      conditionJson: nodeConfig({ option: "asesor" })
    }
  ]);

  return loadFlow(flow.id);
};

export default CreateDefaultBotFlowService;
