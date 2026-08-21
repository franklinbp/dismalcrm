import pino from "pino";

const logger = pino({
  transport: {
    target: "pino-pretty",
    options: {
      ignore: "pid,hostname",
      translateTime: "HH:MM:ss Z",
      colorize: true
    }
  }
});

export { logger };
