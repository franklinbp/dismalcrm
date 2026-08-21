import "./bootstrap";
import "reflect-metadata";
import "express-async-errors";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import * as Sentry from "@sentry/node";

import "./database";
import uploadConfig from "./config/upload";
import AppError from "./errors/AppError";
import routes from "./routes";
import { logger } from "./utils/logger";

Sentry.init({ dsn: process.env.SENTRY_DSN });

const app = express();
const normalizeOrigin = (value: string): string =>
  value.endsWith("/") ? value.slice(0, -1) : value;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3002",
  "http://localhost:7000"
]
  .filter((origin): origin is string => Boolean(origin))
  .map(normalizeOrigin);

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const normalizedOrigin = normalizeOrigin(origin);

      if (
        process.env.NODE_ENV === "development" ||
        allowedOrigins.includes(normalizedOrigin) ||
        (process.env.FRONTEND_URL && normalizedOrigin.includes(process.env.FRONTEND_URL))
      ) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${normalizedOrigin}`);
        callback(new Error("Not allowed by CORS"));
      }
    }
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(helmet());
app.use(Sentry.Handlers.requestHandler());
app.use("/public", express.static(uploadConfig.directory));

app.get("/healthz", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

app.use(routes);

app.use(Sentry.Handlers.errorHandler());

app.use(async (err: Error, req: Request, res: Response, _: NextFunction) => {
  if (err instanceof AppError) {
    logger.warn(err);
    return res.status(err.statusCode).json({ error: err.message });
  }

  logger.error(err);
  return res.status(500).json({ error: "Internal server error" });
});

export default app;
