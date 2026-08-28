import { join } from "path";
import fs from "fs";
import qrCode from "qrcode-terminal";
import { Client, LocalAuth } from "whatsapp-web.js";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import { handleMessage } from "../services/WbotServices/wbotMessageListener";
import {
  getAllowedWhatsappCountryCode,
  isAllowedWhatsappNumber
} from "../services/WhatsappService/WhatsappConnectionPolicy";

export interface Session extends Client {
  id?: number;
}

const sessions: Session[] = [];
const CHROME_LOCK_FILES = new Set([
  "SingletonCookie",
  "SingletonLock",
  "SingletonSocket"
]);

const removeChromeProfileLocks = (sessionPath: string, clientId: string): void => {
  if (!sessionPath.includes(".wwebjs_auth") || !fs.existsSync(sessionPath)) {
    return;
  }

  const removeLocks = (currentPath: string): void => {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        removeLocks(fullPath);
        return;
      }

      if (CHROME_LOCK_FILES.has(entry.name)) {
        fs.unlinkSync(fullPath);
        logger.warn(`Removed stale Chrome profile lock for session ${clientId}: ${fullPath}`);
      }
    });
  };

  try {
    removeLocks(sessionPath);
  } catch (err) {
    logger.error(`Error removing stale Chrome locks for session ${clientId}: ${err}`);
  }
};

const syncUnreadMessages = async (wbot: Session) => {
  try {
    const chats = await wbot.getChats();

    /* eslint-disable no-restricted-syntax */
    /* eslint-disable no-await-in-loop */
    for (const chat of chats) {
      if (!chat.unreadCount || chat.unreadCount <= 0) {
        continue;
      }

      try {
        const unreadMessages = await chat.fetchMessages({
          limit: chat.unreadCount
        });

        for (const msg of unreadMessages) {
          await handleMessage(msg, wbot);
        }

        await chat.sendSeen();
      } catch (err) {
        logger.warn(
          {
            err,
            chatId: chat.id?._serialized,
            chatName: chat.name,
            unreadCount: chat.unreadCount
          },
          "Could not sync unread WhatsApp chat"
        );
      }
    }
  } catch (err) {
    logger.warn({ err }, "Could not list unread WhatsApp chats");
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = whatsapp.name;
      let sessionCfg;

      if (whatsapp && whatsapp.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }

      const args: String = process.env.CHROME_ARGS || "";

      const clientId = "bd_" + whatsapp.id;
      const sessionPath = join(__dirname, "..", "..", ".wwebjs_auth", `session-${clientId}`);
      removeChromeProfileLocks(sessionPath, clientId);

      const wbot: Session = new Client({
        session: sessionCfg,
        authStrategy: new LocalAuth({ clientId }),
        puppeteer: {
          executablePath: process.env.CHROME_BIN || undefined,
          // @ts-ignore
          browserWSEndpoint: process.env.CHROME_WS || undefined,
          args: args.split(" ")
        }
      });

      wbot.on("qr", async qr => {
        logger.info("Session:", sessionName);
        qrCode.generate(qr, { small: true });
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("authenticated", async session => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);
      });

      wbot.on("auth_failure", async msg => {
        console.error(
          `Session: ${sessionName} AUTHENTICATION FAILURE! Reason: ${msg}`
        );

        if (whatsapp.retries > 1) {
          await whatsapp.update({ session: "", retries: 0 });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        logger.info(`Session: ${sessionName} READY`);

        const connectedNumber = wbot.info?.wid?.user || "";
        if (!isAllowedWhatsappNumber(connectedNumber)) {
          const allowedCountryCode = getAllowedWhatsappCountryCode();
          logger.warn(
            {
              sessionId: whatsapp.id,
              sessionName,
              allowedCountryCode
            },
            "Rejected WhatsApp session from a non-authorized country"
          );

          await whatsapp.update({
            status: "DISCONNECTED",
            qrcode: "",
            session: "",
            retries: 0
          });

          io.emit("whatsappSession", {
            action: "update",
            session: whatsapp
          });

          const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
          if (sessionIndex !== -1) {
            sessions.splice(sessionIndex, 1);
          }

          try {
            await wbot.logout();
          } catch (logoutError) {
            logger.warn({ logoutError }, "Could not log out rejected WhatsApp session");
          }

          try {
            await wbot.destroy();
          } catch (destroyError) {
            logger.warn({ destroyError }, "Could not destroy rejected WhatsApp session");
          }

          reject(new AppError("ERR_WAPP_COUNTRY_NOT_ALLOWED", 403));
          return;
        }

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        wbot.sendPresenceAvailable();

        resolve(wbot);

        syncUnreadMessages(wbot);
      });

      wbot.initialize();
    } catch (err) {
      logger.error(err);
      reject(err);
    }
  });
};

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }
  return sessions[sessionIndex];
};

export const removeWbot = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};
