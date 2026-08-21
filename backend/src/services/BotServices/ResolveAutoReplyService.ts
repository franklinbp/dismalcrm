import Contact from "../../models/Contact";
import Message from "../../models/Message";
import QuickAnswer from "../../models/QuickAnswer";
import Setting from "../../models/Setting";
import Ticket from "../../models/Ticket";

interface Request {
  messageBody: string;
  contact: Contact;
  ticket?: Ticket;
}

interface Rule {
  keywords: string[];
  response?: string;
  quickAnswerShortcut?: string;
}

interface AutoReplyResult {
  body?: string;
  quickAnswerId?: number;
  isDefault: boolean;
}

type CachePayload = {
  enabled: boolean;
  oncePerTicket: boolean;
  rules: Rule[];
  defaultResponse: string;
};

const CACHE_TTL_MS = 30000;
let cache: { value: CachePayload; expiresAt: number } | null = null;

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const applyVariables = (
  response: string,
  contact: Contact,
  messageBody: string
): string => {
  const firstName = (contact.name || "").split(" ")[0] || "";

  return response
    .replace(/{{\s*name\s*}}/gi, contact.name || "")
    .replace(/{{\s*firstName\s*}}/gi, firstName)
    .replace(/{{\s*phone\s*}}/gi, contact.number || "")
    .replace(/{{\s*message\s*}}/gi, messageBody || "");
};

const parseResponse = (
  rawResponse: string
): Pick<Rule, "response" | "quickAnswerShortcut"> => {
  const quickAnswerMatch = rawResponse.match(/^@?(quick|respuesta):(.+)$/i);

  if (quickAnswerMatch) {
    return {
      quickAnswerShortcut: quickAnswerMatch[2].trim()
    };
  }

  return { response: rawResponse };
};

const parseRules = (raw: string): Rule[] => {
  if (!raw) return [];

  return raw
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line && !line.startsWith("#"))
    .map(line => {
      const separator = line.includes("=>") ? "=>" : "=";
      const [trigger, ...responseParts] = line.split(separator);
      const parsedResponse = parseResponse(responseParts.join(separator).trim());

      return {
        keywords: (trigger || "")
          .split(/[|,]/)
          .map(keyword => normalizeText(keyword))
          .filter(Boolean),
        ...parsedResponse
      };
    })
    .filter(
      rule =>
        rule.keywords.length > 0 &&
        (Boolean(rule.response) || Boolean(rule.quickAnswerShortcut))
    )
    .sort((a, b) => {
      const left = Math.max(...a.keywords.map(keyword => keyword.length));
      const right = Math.max(...b.keywords.map(keyword => keyword.length));
      return right - left;
    });
};

const loadSettings = async (): Promise<CachePayload> => {
  if (cache && cache.expiresAt > Date.now()) {
    return cache.value;
  }

  const [
    enabledSetting,
    oncePerTicketSetting,
    rulesSetting,
    defaultResponseSetting
  ] = await Promise.all([
    Setting.findOne({ where: { key: "autoReplyEnabled" } }),
    Setting.findOne({ where: { key: "autoReplyOncePerTicket" } }),
    Setting.findOne({ where: { key: "autoReplyRules" } }),
    Setting.findOne({ where: { key: "autoReplyDefaultResponse" } })
  ]);

  const value: CachePayload = {
    enabled: enabledSetting?.value === "enabled",
    oncePerTicket: oncePerTicketSetting?.value !== "disabled",
    rules: parseRules(rulesSetting?.value || ""),
    defaultResponse: defaultResponseSetting?.value || ""
  };

  cache = {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS
  };

  return value;
};

const findQuickAnswerByShortcut = async (
  shortcut: string
): Promise<QuickAnswer | null> => {
  const normalizedShortcut = normalizeText(shortcut);
  const quickAnswers = await QuickAnswer.findAll();

  return (
    quickAnswers.find(
      quickAnswer => normalizeText(quickAnswer.shortcut || "") === normalizedShortcut
    ) || null
  );
};

const ResolveAutoReplyService = async ({
  messageBody,
  contact,
  ticket
}: Request): Promise<AutoReplyResult | null> => {
  const text = normalizeText(messageBody || "");
  if (!text) return null;

  const { enabled, oncePerTicket, rules, defaultResponse } = await loadSettings();
  if (!enabled) return null;

  const matched = rules.find(rule =>
    rule.keywords.some(keyword => text.includes(keyword))
  );

  if (matched?.quickAnswerShortcut) {
    const quickAnswer = await findQuickAnswerByShortcut(matched.quickAnswerShortcut);

    if (quickAnswer) {
      return {
        quickAnswerId: quickAnswer.id,
        isDefault: false
      };
    }
  }

  if (matched?.response) {
    return {
      body: applyVariables(matched.response, contact, messageBody),
      isDefault: false
    };
  }

  if (oncePerTicket && ticket) {
    const inboundMessages = await Message.count({
      where: {
        ticketId: ticket.id,
        fromMe: false
      }
    });

    if (inboundMessages > 1) {
      return null;
    }
  }

  if (!defaultResponse) return null;

  return {
    body: applyVariables(defaultResponse, contact, messageBody),
    isDefault: true
  };
};

export default ResolveAutoReplyService;
