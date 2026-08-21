import fs from "fs";
import path from "path";
import { Op, UniqueConstraintError } from "sequelize";

import uploadConfig from "../../config/upload";
import BotExecution from "../../models/BotExecution";
import BotFlow from "../../models/BotFlow";
import BotRule from "../../models/BotRule";
import CommercialLeadTask from "../../models/CommercialLeadTask";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import CreateCommercialLeadFromTicketService from "../CommercialLeadServices/CreateCommercialLeadFromTicketService";
import CreateCommercialLeadTaskService from "../CommercialLeadServices/CreateCommercialLeadTaskService";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import SendWhatsAppMedia from "../WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../WbotServices/SendWhatsAppMessage";
import {
  applyRuleVariables,
  findMatchingBotRule,
  parseRulePayload,
  ParsedBotRulePayload
} from "./BotMasterRuleUtils";

interface Request {
  messageId: string;
  messageBody: string;
  companyId: number;
  ticket: Ticket;
  contact: Contact;
  channel?: string;
}

interface Result {
  flowActive: boolean;
  handled: boolean;
  duplicate?: boolean;
  status?: string;
  flowId?: number;
  ruleId?: number;
}

interface ButtonPayload {
  id?: string;
  title?: string;
}

interface CatalogRow {
  id?: string;
  title?: string;
  description?: string;
}

interface CatalogSection {
  section?: string;
  rows?: CatalogRow[];
}

interface AttachmentPayload {
  source?: string;
  title?: string;
  type?: string;
  mimetype?: string;
}

const asRecords = <T>(value: unknown[]): T[] =>
  value.filter(item => Boolean(item) && typeof item === "object") as T[];

const appendStructuredOptions = (
  response: string,
  payload: ParsedBotRulePayload
): string => {
  const buttons = asRecords<ButtonPayload>(payload.buttons).filter(
    button => button.title || button.id
  );
  const catalog = asRecords<CatalogSection>(payload.catalog);
  const parts = [response.trim()];

  if (buttons.length) {
    parts.push(
      `Opciones:\n${buttons
        .map(button => `- ${button.title || button.id}`)
        .join("\n")}`
    );
  }

  const catalogRows = catalog.reduce<Array<CatalogRow & { section?: string }>>(
    (rows, section) => {
      const sectionRows = (section.rows || []).map(row => ({
        section: section.section,
        ...row
      }));
      return rows.concat(sectionRows);
    },
    []
  );
  if (catalogRows.length) {
    parts.push(
      `Catalogo:\n${catalogRows
        .map(row => {
          const title = row.title || row.id || "Producto";
          const description = row.description ? ` - ${row.description}` : "";
          return `- ${title}${description}`;
        })
        .join("\n")}`
    );
  }

  return parts.filter(Boolean).join("\n\n").slice(0, 3900);
};

const resolveSafeAttachment = (
  attachment: AttachmentPayload
): { filePath: string; filename: string; mimetype: string } | null => {
  if (
    typeof attachment.source !== "string" ||
    !attachment.source ||
    /^https?:\/\//i.test(attachment.source)
  ) {
    return null;
  }

  const uploadRoot = path.resolve(uploadConfig.directory);
  const filePath = path.resolve(uploadRoot, attachment.source);
  if (
    filePath !== uploadRoot &&
    !filePath.startsWith(`${uploadRoot}${path.sep}`)
  ) {
    return null;
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return null;
  }

  return {
    filePath,
    filename: attachment.title || path.basename(filePath),
    mimetype:
      attachment.mimetype || attachment.type || "application/octet-stream"
  };
};

const shouldCreateLead = (actions: string[]): boolean =>
  actions.some(action =>
    ["crear lead comercial", "registrar interes"].includes(
      action.toLowerCase().trim()
    )
  );

const shouldScheduleFollowUp = (actions: string[]): boolean =>
  actions.some(action => action.toLowerCase().includes("seguimiento"));

const shouldHandoff = (payload: ParsedBotRulePayload): boolean => {
  const mode = String(payload.nextStep.mode || "").toUpperCase();
  return (
    mode === "HUMAN_HANDOFF" ||
    payload.actions.some(action =>
      ["pausar bot", "notificar asesor", "asignar asesor"].includes(
        action.toLowerCase().trim()
      )
    )
  );
};

const applyCommercialActions = async (
  payload: ParsedBotRulePayload,
  ticket: Ticket,
  companyId: number
): Promise<{ leadId?: number; followUpTaskId?: number; handoff: boolean }> => {
  let leadId: number | undefined;
  let followUpTaskId: number | undefined;

  if (
    shouldCreateLead(payload.actions) ||
    shouldScheduleFollowUp(payload.actions)
  ) {
    const { lead } = await CreateCommercialLeadFromTicketService(ticket.id);
    leadId = lead.id;

    if (shouldScheduleFollowUp(payload.actions)) {
      const existingTask = await CommercialLeadTask.findOne({
        where: {
          leadId: lead.id,
          companyId,
          status: "PENDING",
          title: "Seguimiento automatico del bot"
        }
      });

      if (existingTask) {
        followUpTaskId = existingTask.id;
      } else {
        const task = await CreateCommercialLeadTaskService({
          leadId: lead.id,
          title: "Seguimiento automatico del bot",
          dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          priority: "normal",
          notes: "Creado por una regla publicada del bot."
        });
        followUpTaskId = task.id;
      }
    }
  }

  const handoff = shouldHandoff(payload);
  if (handoff) {
    await UpdateTicketService({
      ticketId: ticket.id,
      companyId,
      ticketData: { status: "pending" }
    });
    await ticket.update({ chatbot: false });
  }

  return { leadId, followUpTaskId, handoff };
};

const acquireExecution = async ({
  flow,
  messageId,
  messageBody,
  companyId,
  ticket,
  contact,
  channel
}: Omit<Request, "channel"> & {
  flow: BotFlow;
  channel: string;
}): Promise<{ execution: BotExecution; acquired: boolean }> => {
  const existing = await BotExecution.findOne({
    where: { companyId, channel, messageId }
  });

  if (existing) {
    return { execution: existing, acquired: false };
  }

  try {
    const execution = await BotExecution.create({
      flowId: flow.id,
      ticketId: ticket.id,
      contactId: contact.id,
      messageId,
      companyId,
      status: "PROCESSING",
      channel,
      lastInput: messageBody,
      attempts: 1,
      metadataJson: JSON.stringify({ mode: "PRODUCTION_RUNTIME" })
    });
    return { execution, acquired: true };
  } catch (err) {
    if (!(err instanceof UniqueConstraintError)) throw err;
    const duplicate = await BotExecution.findOne({
      where: { companyId, channel, messageId }
    });
    if (!duplicate) throw err;
    return { execution: duplicate, acquired: false };
  }
};

const RunBotFlowService = async ({
  messageId,
  messageBody,
  companyId,
  ticket,
  contact,
  channel = "whatsapp"
}: Request): Promise<Result> => {
  if (process.env.BOT_RUNTIME_ENABLED !== "true") {
    return { flowActive: false, handled: false };
  }

  const flow = await BotFlow.findOne({
    where: {
      companyId,
      active: true,
      runtimeEnabled: true,
      channel: { [Op.in]: [channel, "all"] }
    },
    order: [
      ["priority", "ASC"],
      ["id", "ASC"]
    ]
  });

  if (!flow) return { flowActive: false, handled: false };

  const { execution, acquired } = await acquireExecution({
    flow,
    messageId,
    messageBody,
    companyId,
    ticket,
    contact,
    channel
  });

  if (!acquired) {
    return {
      flowActive: true,
      handled: execution.status !== "NO_MATCH",
      duplicate: true,
      status: execution.status,
      flowId: flow.id,
      ruleId: execution.ruleId
    };
  }

  try {
    const rules = await BotRule.findAll({
      where: { flowId: flow.id, companyId, active: true },
      order: [
        ["priority", "ASC"],
        ["id", "ASC"]
      ]
    });
    const rule = findMatchingBotRule(rules, messageBody);

    if (!rule) {
      await execution.update({
        status: "NO_MATCH",
        processedAt: new Date(),
        metadataJson: JSON.stringify({
          mode: "PRODUCTION_RUNTIME",
          matched: false
        })
      });
      return {
        flowActive: true,
        handled: false,
        status: "NO_MATCH",
        flowId: flow.id
      };
    }

    const payload = parseRulePayload(rule);
    const response = appendStructuredOptions(
      applyRuleVariables(rule.responseText || "", {
        nombre: contact.name || "cliente",
        telefono: contact.number,
        mensaje: messageBody
      }),
      payload
    );

    if (response) {
      await SendWhatsAppMessage({ body: `\u200e${response}`, ticket });
    }

    const sentAttachments: string[] = [];
    const skippedAttachments: string[] = [];
    for (const attachment of asRecords<AttachmentPayload>(
      payload.attachments
    )) {
      const safeAttachment = resolveSafeAttachment(attachment);
      if (!safeAttachment) {
        skippedAttachments.push(
          attachment.source || attachment.title || "sin fuente"
        );
        continue;
      }

      await SendWhatsAppMedia({
        ticket,
        mediaPath: safeAttachment.filePath,
        mediaName: safeAttachment.filename,
        mediaType: safeAttachment.mimetype,
        deleteFile: false
      });
      sentAttachments.push(attachment.source || safeAttachment.filename);
    }

    const actions = await applyCommercialActions(payload, ticket, companyId);
    const status = actions.handoff ? "HANDOFF" : "REPLIED";

    await execution.update({
      ruleId: rule.id,
      status,
      lastOutput: response,
      processedAt: new Date(),
      errorMessage: null,
      metadataJson: JSON.stringify({
        mode: "PRODUCTION_RUNTIME",
        matched: true,
        ruleName: rule.name,
        actions: payload.actions,
        sentAttachments,
        skippedAttachments,
        ...actions
      })
    });

    logger.info(
      {
        companyId,
        flowId: flow.id,
        ruleId: rule.id,
        ticketId: ticket.id,
        executionId: execution.id,
        status
      },
      "Bot runtime handled WhatsApp message"
    );

    return {
      flowActive: true,
      handled: true,
      status,
      flowId: flow.id,
      ruleId: rule.id
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await execution.update({
      status: "FAILED",
      errorMessage: message.slice(0, 4000),
      processedAt: new Date()
    });
    logger.error(
      {
        err,
        companyId,
        flowId: flow.id,
        ticketId: ticket.id,
        executionId: execution.id
      },
      "Bot runtime failed to handle WhatsApp message"
    );

    return {
      flowActive: true,
      handled: true,
      status: "FAILED",
      flowId: flow.id,
      ruleId: execution.ruleId
    };
  }
};

export default RunBotFlowService;
