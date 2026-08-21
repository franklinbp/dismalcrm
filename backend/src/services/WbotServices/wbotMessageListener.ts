import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import * as Sentry from "@sentry/node";

import {
  Contact as WbotContact,
  Message as WbotMessage,
  MessageAck,
  Client
} from "whatsapp-web.js";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import { debounce } from "../../helpers/Debounce";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import CreateContactService from "../ContactServices/CreateContactService";
import GetContactService from "../ContactServices/GetContactService";
import formatBody from "../../helpers/Mustache";
import ResolveAutoReplyService from "../BotServices/ResolveAutoReplyService";
import SendQuickAnswerService from "../QuickAnswerService/SendQuickAnswerService";
import RunBotFlowService from "../BotFlowServices/RunBotFlowService";

interface Session extends Client {
  id?: number;
}

interface ResolvedContact {
  id: {
    user: string;
  };
  name?: string;
  pushname?: string;
  isGroup: boolean;
  getProfilePicUrl?: () => Promise<string>;
}

interface ResolvedChat {
  isGroup: boolean;
  unreadCount: number;
  name?: string;
}

const writeFileAsync = promisify(writeFile);
const processingMessages = new Set<string>();
const WHATSAPP_LOOKUP_RETRY_DELAY_MS = 300;

const wait = (milliseconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, milliseconds));

const errorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

const retryWhatsAppLookup = async <T>(
  firstLookup: () => Promise<T>,
  retryLookup: () => Promise<T>,
  logContext: Record<string, unknown>
): Promise<T | undefined> => {
  let firstError: unknown;

  try {
    const result = await firstLookup();
    if (result !== null && result !== undefined) {
      return result;
    }
    firstError = new Error("WhatsApp lookup returned no result");
  } catch (err) {
    firstError = err;
  }

  await wait(WHATSAPP_LOOKUP_RETRY_DELAY_MS);

  try {
    const result = await retryLookup();
    if (result !== null && result !== undefined) {
      return result;
    }
    throw new Error("WhatsApp lookup retry returned no result");
  } catch (err) {
    logger.warn(
      {
        ...logContext,
        err,
        firstError: errorMessage(firstError)
      },
      "WhatsApp lookup failed; using message data fallback"
    );
    return undefined;
  }
};

const serializedIdUser = (serializedId: string): string => {
  const separatorIndex = serializedId.lastIndexOf("@");
  return separatorIndex === -1
    ? serializedId
    : serializedId.substring(0, separatorIndex);
};

const fallbackContact = (
  serializedId: string,
  name?: string,
  isGroup = false
): ResolvedContact => {
  const number = serializedIdUser(serializedId);

  return {
    id: { user: number },
    name: name || number,
    pushname: name,
    isGroup
  };
};

const messageNotifyName = (msg: WbotMessage): string | undefined => {
  const rawData = (msg as WbotMessage & { rawData?: { notifyName?: string } })
    .rawData;
  return rawData?.notifyName;
};

const resolveMessageContact = async (
  msg: WbotMessage,
  wbot: Session
): Promise<ResolvedContact> => {
  const contactId = msg.fromMe ? msg.to : msg.author || msg.from;

  const contact = await retryWhatsAppLookup<WbotContact>(
    () => (msg.fromMe ? wbot.getContactById(contactId) : msg.getContact()),
    () => wbot.getContactById(contactId),
    {
      lookup: "message-contact",
      messageId: msg.id?.id,
      whatsappId: wbot.id,
      contactId
    }
  );

  return (
    contact ||
    fallbackContact(
      contactId,
      messageNotifyName(msg),
      contactId.endsWith("@g.us")
    )
  );
};

const resolveMessageChat = async (
  msg: WbotMessage,
  wbot: Session
): Promise<ResolvedChat> => {
  const chatId = msg.fromMe ? msg.to : msg.from;
  const chat = await retryWhatsAppLookup(
    () => msg.getChat(),
    () => wbot.getChatById(chatId),
    {
      lookup: "message-chat",
      messageId: msg.id?.id,
      whatsappId: wbot.id,
      chatId
    }
  );

  return (
    chat || {
      isGroup: chatId.endsWith("@g.us"),
      unreadCount: msg.fromMe ? 0 : 1
    }
  );
};

const resolveGroupContact = async (
  msg: WbotMessage,
  wbot: Session,
  groupName?: string
): Promise<ResolvedContact> => {
  const groupId = msg.fromMe ? msg.to : msg.from;
  const contact = await retryWhatsAppLookup(
    () => wbot.getContactById(groupId),
    () => wbot.getContactById(groupId),
    {
      lookup: "group-contact",
      messageId: msg.id?.id,
      whatsappId: wbot.id,
      groupId
    }
  );

  return contact || fallbackContact(groupId, groupName, true);
};

const verifyContact = async (
  msgContact: ResolvedContact,
  companyId: number
): Promise<Contact> => {
  let profilePicUrl = "";

  if (msgContact.getProfilePicUrl) {
    try {
      profilePicUrl = await msgContact.getProfilePicUrl();
    } catch (err) {
      logger.warn(
        `Could not get WhatsApp profile picture for ${msgContact.id.user}: ${err}`
      );
    }
  }

  const contactData = {
    name: msgContact.name || msgContact.pushname || msgContact.id.user,
    number: msgContact.id.user,
    profilePicUrl,
    isGroup: msgContact.isGroup,
    companyId,
    channel: "whatsapp"
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: WbotMessage
): Promise<Message | null> => {
  if (!msg.hasQuotedMsg) return null;

  const wbotQuotedMsg = await msg.getQuotedMessage();

  const quotedMsg = await Message.findOne({
    where: { id: wbotQuotedMsg.id.id }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

// generate random id string for file names, function got from: https://stackoverflow.com/a/1349426/1851801
function makeRandomId(length: number) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const verifyMediaMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const quotedMsg = await verifyQuotedMessage(msg);

  const media = await msg.downloadMedia();

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  let randomId = makeRandomId(5);

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${randomId}-${new Date().getTime()}.${ext}`;
  } else {
    media.filename =
      media.filename.split(".").slice(0, -1).join(".") +
      "." +
      randomId +
      "." +
      media.filename.split(".").slice(-1);
  }

  try {
    await writeFileAsync(
      join(__dirname, "..", "..", "..", "public", media.filename),
      media.data,
      "base64"
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }

  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body || media.filename,
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id
  };

  await ticket.update({ lastMessage: msg.body || media.filename });
  const newMessage = await CreateMessageService({
    messageData,
    companyId: ticket.companyId
  });

  return newMessage;
};

const verifyMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  if (msg.type === "location") msg = prepareLocation(msg);

  const quotedMsg = await verifyQuotedMessage(msg);
  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body,
    fromMe: msg.fromMe,
    mediaType: msg.type,
    read: msg.fromMe,
    quotedMsgId: quotedMsg?.id
  };

  // temporaryly disable ts checks because of type definition bug for Location object
  // @ts-ignore
  await ticket.update({
    lastMessage:
      msg.type === "location"
        ? msg.location.description
          ? "Localization - " + msg.location.description.split("\\n")[0]
          : "Localization"
        : msg.body
  });

  await CreateMessageService({ messageData, companyId: ticket.companyId });
};

const prepareLocation = (msg: WbotMessage): WbotMessage => {
  let gmapsUrl =
    "https://maps.google.com/maps?q=" +
    msg.location.latitude +
    "%2C" +
    msg.location.longitude +
    "&z=17&hl=pt-BR";

  msg.body = "data:image/png;base64," + msg.body + "|" + gmapsUrl;

  // temporaryly disable ts checks because of type definition bug for Location object
  // @ts-ignore
  msg.body +=
    "|" +
    (msg.location.description
      ? msg.location.description
      : msg.location.latitude + ", " + msg.location.longitude);

  return msg;
};

const verifyQueue = async (
  wbot: Session,
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  const { queues, greetingMessage } = await ShowWhatsAppService(wbot.id!);

  if (queues.length === 1) {
    await UpdateTicketService({
      ticketData: { queueId: queues[0].id },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });

    return;
  }

  const selectedOption = msg.body;

  const choosenQueue = queues[+selectedOption - 1];

  if (choosenQueue) {
    await UpdateTicketService({
      ticketData: { queueId: choosenQueue.id },
      ticketId: ticket.id,
      companyId: ticket.companyId
    });

    const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, contact);

    const sentMessage = await wbot.sendMessage(`${contact.number}@c.us`, body);

    await verifyMessage(sentMessage, ticket, contact);
  } else {
    let options = "";

    queues.forEach((queue, index) => {
      options += `*${index + 1}* - ${queue.name}\n`;
    });

    const body = formatBody(`\u200e${greetingMessage}\n${options}`, contact);

    const debouncedSentMessage = debounce(
      async () => {
        const sentMessage = await wbot.sendMessage(
          `${contact.number}@c.us`,
          body
        );
        verifyMessage(sentMessage, ticket, contact);
      },
      3000,
      ticket.id
    );

    debouncedSentMessage();
  }
};

const isValidMsg = (msg: WbotMessage): boolean => {
  if (msg.from === "status@broadcast") return false;
  if (
    msg.type === "chat" ||
    msg.type === "audio" ||
    msg.type === "ptt" ||
    msg.type === "video" ||
    msg.type === "image" ||
    msg.type === "document" ||
    msg.type === "vcard" ||
    //msg.type === "multi_vcard" ||
    msg.type === "sticker" ||
    msg.type === "location"
  )
    return true;
  return false;
};

const handleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  const messageId = msg.id?.id;
  let processingStage = "validate-message";

  if (messageId) {
    if (processingMessages.has(messageId)) {
      return;
    }

    processingMessages.add(messageId);
  }

  if (!isValidMsg(msg)) {
    if (messageId) {
      processingMessages.delete(messageId);
    }

    return;
  }

  try {
    let msgContact: ResolvedContact;
    let groupContact: Contact | undefined;

    processingStage = "resolve-message-contact";
    if (msg.fromMe) {
      if (/\u200e/.test(msg.body[0])) return;

      if (
        !msg.hasMedia &&
        msg.type !== "location" &&
        msg.type !== "chat" &&
        msg.type !== "vcard"
      )
        return;
    }

    msgContact = await resolveMessageContact(msg, wbot);

    processingStage = "load-chat";
    const chat = await resolveMessageChat(msg, wbot);

    processingStage = "load-whatsapp-connection";
    const whatsapp = await ShowWhatsAppService(wbot.id!);

    if (!whatsapp.companyId) {
      throw new Error(
        `WhatsApp connection ${whatsapp.id} is not assigned to a company`
      );
    }

    if (chat.isGroup) {
      processingStage = "resolve-group-contact";
      const msgGroupContact = await resolveGroupContact(msg, wbot, chat.name);
      groupContact = await verifyContact(msgGroupContact, whatsapp.companyId);
    }

    const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;

    processingStage = "upsert-contact";
    const contact = await verifyContact(msgContact, whatsapp.companyId);

    if (
      unreadMessages === 0 &&
      whatsapp.farewellMessage &&
      formatBody(whatsapp.farewellMessage, contact) === msg.body
    )
      return;

    processingStage = "find-or-create-ticket";
    const ticket = await FindOrCreateTicketService(
      contact,
      wbot.id!,
      unreadMessages,
      groupContact,
      whatsapp.companyId
    );

    processingStage = "persist-message";
    if (msg.hasMedia) {
      await verifyMediaMessage(msg, ticket, contact);
    } else {
      await verifyMessage(msg, ticket, contact);
    }

    // Respuesta automatica del bot de DismalCRM.
    let autoReplySent = false;
    let publishedFlowActive = false;
    if (!msg.fromMe && !chat.isGroup && msg.type === "chat" && !ticket.userId) {
      if (messageId) {
        processingStage = "run-published-bot-flow";
        const botResult = await RunBotFlowService({
          messageId,
          messageBody: msg.body,
          companyId: whatsapp.companyId,
          ticket,
          contact,
          channel: "whatsapp"
        });
        publishedFlowActive = botResult.flowActive;
        autoReplySent = botResult.handled;
      }

      if (!publishedFlowActive) {
        processingStage = "resolve-legacy-auto-reply";
        const autoReply = await ResolveAutoReplyService({
          messageBody: msg.body,
          contact,
          ticket
        });

        if (autoReply) {
          if (autoReply.quickAnswerId) {
            await SendQuickAnswerService({
              quickAnswerId: String(autoReply.quickAnswerId),
              ticketId: String(ticket.id)
            });
          }

          if (autoReply.body) {
            const sentMessage = await wbot.sendMessage(
              `${contact.number}@c.us`,
              formatBody(`\u200e${autoReply.body}`, contact)
            );

            await verifyMessage(sentMessage, ticket, contact);
          }

          autoReplySent = true;
        }
      }
    }

    if (
      !autoReplySent &&
      !ticket.queue &&
      !chat.isGroup &&
      !msg.fromMe &&
      !ticket.userId &&
      whatsapp.queues.length >= 1
    ) {
      processingStage = "verify-ticket-queue";
      await verifyQueue(wbot, msg, ticket, contact);
    }

    if (msg.type === "vcard") {
      try {
        const array = msg.body.split("\n");
        const obj = [];
        let contactName = "";
        for (let index = 0; index < array.length; index++) {
          const v = array[index];
          const values = v.split(":");
          for (let ind = 0; ind < values.length; ind++) {
            if (values[ind].indexOf("+") !== -1) {
              obj.push({ number: values[ind] });
            }
            if (values[ind].indexOf("FN") !== -1) {
              contactName = values[ind + 1];
            }
          }
        }
        for await (const ob of obj) {
          await CreateContactService({
            name: contactName,
            number: ob.number.replace(/\D/g, ""),
            companyId: whatsapp.companyId,
            channel: "whatsapp"
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      {
        err,
        processingStage,
        messageId,
        whatsappId: wbot.id,
        from: msg.from,
        to: msg.to,
        type: msg.type,
        fromMe: msg.fromMe
      },
      "Error handling WhatsApp message"
    );
  } finally {
    if (messageId) {
      processingMessages.delete(messageId);
    }
  }
};

const handleMsgAck = async (msg: WbotMessage, ack: MessageAck) => {
  await new Promise(r => setTimeout(r, 500));

  const io = getIO();

  try {
    const messageToUpdate = await Message.findByPk(msg.id.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });
    if (!messageToUpdate) {
      return;
    }
    await messageToUpdate.update({ ack });

    io.to(messageToUpdate.ticketId.toString()).emit("appMessage", {
      action: "update",
      message: messageToUpdate
    });
  } catch (err) {
    Sentry.captureException(err);
    logger.error(
      {
        err,
        messageId: msg.id?.id,
        ack
      },
      "Error handling WhatsApp message acknowledgement"
    );
  }
};

const wbotMessageListener = (wbot: Session): void => {
  wbot.on("message", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("message_create", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("media_uploaded", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("message_ack", async (msg, ack) => {
    handleMsgAck(msg, ack);
  });
};

export { wbotMessageListener, handleMessage };
