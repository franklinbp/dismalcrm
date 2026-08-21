import AppError from "../../errors/AppError";
import BotFlow from "../../models/BotFlow";
import BotRule from "../../models/BotRule";

interface Request {
  flowId: string | number;
  companyId: number;
}

const toJson = (value: unknown): string => JSON.stringify(value, null, 2);

const CreateDefaultBotRulesService = async ({
  flowId,
  companyId
}: Request): Promise<BotRule[]> => {
  const flow = await BotFlow.findOne({
    where: { id: flowId, companyId }
  });

  if (!flow) {
    throw new AppError("Flujo bot no encontrado", 404);
  }

  const existing = await BotRule.count({
    where: { flowId: flow.id, companyId }
  });

  if (existing > 0) {
    return BotRule.findAll({
      where: { flowId: flow.id, companyId },
      order: [["priority", "ASC"]]
    });
  }

  await BotRule.bulkCreate([
    {
      flowId: flow.id,
      companyId,
      name: "Bienvenida comercial",
      active: true,
      priority: 5,
      operand: "CONTAINS",
      keyword: "hola, buenas, informacion, información, info",
      responseText:
        "Hola {nombre}, soy el asistente de Dismal. Escribe el nombre de la opcion que necesitas.",
      buttonsJson: toJson([
        { id: "office", title: "Office y Microsoft 365" },
        { id: "catalogo", title: "Catalogo y precios" },
        { id: "distribuidor", title: "Programa distribuidor" },
        { id: "asesor", title: "Hablar con asesor" }
      ]),
      attachmentsJson: toJson([]),
      catalogJson: toJson([]),
      actionsJson: toJson([]),
      nextStepJson: toJson({ mode: "WAIT_CUSTOMER_CHOICE" })
    },
    {
      flowId: flow.id,
      companyId,
      name: "Office 365",
      active: true,
      priority: 10,
      operand: "CONTAINS",
      keyword: "office, office 365, microsoft 365, 365",
      responseText:
        "Hola {nombre}, tenemos Office 365 con entrega inmediata. Te puedo enviar precios por tipo de licencia, cantidad de equipos o plan distribuidor.",
      buttonsJson: toJson([
        { id: "office-precios", title: "Ver precios" },
        { id: "office-distribuidor", title: "Distribuidor" },
        { id: "asesor", title: "Hablar con asesor" }
      ]),
      attachmentsJson: toJson([]),
      catalogJson: toJson([
        {
          section: "Office 365",
          rows: [
            {
              id: "office-a3",
              title: "Office 365 A3",
              description: "Apps de escritorio y activacion para 5 dispositivos"
            },
            {
              id: "office-e3",
              title: "Office 365 E3",
              description: "Plan completo con mayor capacidad"
            }
          ]
        }
      ]),
      actionsJson: toJson(["Crear lead comercial", "Programar seguimiento"]),
      nextStepJson: toJson({ mode: "WAIT_CUSTOMER_CHOICE" })
    },
    {
      flowId: flow.id,
      companyId,
      name: "Lista de precios",
      active: true,
      priority: 20,
      operand: "CONTAINS",
      keyword: "precio, precios, lista, catalogo, distribuidor, mayorista",
      responseText:
        "Claro {nombre}, te comparto la lista de precios actualizada. Tenemos licencias digitales, entrega inmediata y soporte tecnico.",
      buttonsJson: toJson([
        { id: "catalogo-general", title: "Catalogo general" },
        { id: "precios-distribuidor", title: "Precios distribuidor" }
      ]),
      attachmentsJson: toJson([
        {
          type: "pdf",
          title: "Catalogo general Dismal",
          source: "catalogos/catalogo-general.pdf"
        }
      ]),
      catalogJson: toJson([]),
      actionsJson: toJson(["Enviar catalogo", "Registrar interes"]),
      nextStepJson: toJson({ mode: "CREATE_OR_UPDATE_LEAD" })
    },
    {
      flowId: flow.id,
      companyId,
      name: "Soporte o asesor",
      active: true,
      priority: 30,
      operand: "CONTAINS",
      keyword: "ayuda, soporte, problema, asesor, humano",
      responseText:
        "{nombre}, te paso con un asesor para revisar tu caso con mas detalle. Un momento por favor.",
      buttonsJson: toJson([]),
      attachmentsJson: toJson([]),
      catalogJson: toJson([]),
      actionsJson: toJson(["Pausar bot", "Notificar asesor"]),
      nextStepJson: toJson({ mode: "HUMAN_HANDOFF" })
    }
  ]);

  return BotRule.findAll({
    where: { flowId: flow.id, companyId },
    order: [["priority", "ASC"]]
  });
};

export default CreateDefaultBotRulesService;
