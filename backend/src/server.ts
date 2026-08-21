import gracefulShutdown from "http-graceful-shutdown";
import app from "./app";
import { initIO } from "./libs/socket";
import { logger } from "./utils/logger";
import { StartAllWhatsAppsSessions } from "./services/WbotServices/StartAllWhatsAppsSessions";
import { startCampaignWorker } from "./services/CampaignServices/CampaignWorker";
import { initRedis } from "./libs/redisStore";

const server = app.listen(process.env.PORT, () => {
  logger.info(`Server started on port: ${process.env.PORT}`);
});

initIO(server);

StartAllWhatsAppsSessions();
initRedis();
startCampaignWorker();
gracefulShutdown(server);
