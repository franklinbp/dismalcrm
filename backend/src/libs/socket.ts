import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import { verify } from "jsonwebtoken";
import AppError from "../errors/AppError";
import { logger } from "../utils/logger";
import authConfig from "../config/auth";

let io: SocketIO;
const normalizeOrigin = (value: string): string =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3002",
  "http://localhost:7000" // Añadido para el puerto por defecto en algunos VPS
]
  .filter((origin): origin is string => Boolean(origin))
  .map(normalizeOrigin);

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const normalizedOrigin = normalizeOrigin(origin);

        // Innovación: Permitir cualquier origen en modo desarrollo o si coincide con la lista
        if (process.env.NODE_ENV === "development" || allowedOrigins.includes(normalizedOrigin) || normalizedOrigin.includes(process.env.FRONTEND_URL || "")) {
          callback(null, true);
        } else {
          logger.warn(`Socket CORS blocked origin: ${normalizedOrigin}`);
          callback(new Error("Not allowed by Socket CORS"));
        }
      },
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.on("connection", socket => {
    const tokenRaw = socket.handshake.query.token;
    const token =
      typeof tokenRaw === "string"
        ? tokenRaw
        : Array.isArray(tokenRaw)
        ? tokenRaw[0]
        : "";

    if (!token) {
      logger.warn("Socket without token. Disconnecting.");
      socket.disconnect();
      return io;
    }

    let tokenData = null;
    try {
      tokenData = verify(token, authConfig.secret);
      logger.debug(JSON.stringify(tokenData), "io-onConnection: tokenData");
    } catch (error) {
      logger.error(JSON.stringify(error), "Error decoding token");
      socket.disconnect();
      return io;
    }

    logger.info("Client Connected");
    socket.on("joinChatBox", (ticketId: string) => {
      logger.info("A client joined a ticket channel");
      socket.join(ticketId);
    });

    socket.on("joinNotification", () => {
      logger.info("A client joined notification channel");
      socket.join("notification");
    });

    socket.on("joinTickets", (status: string) => {
      logger.info(`A client joined to ${status} tickets channel.`);
      socket.join(status);
    });

    socket.on("disconnect", () => {
      logger.info("Client disconnected");
    });

    return socket;
  });
  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
