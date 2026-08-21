import { Router } from "express";

import userRoutes from "./userRoutes";
import authRoutes from "./authRoutes";
import settingRoutes from "./settingRoutes";
import contactRoutes from "./contactRoutes";
import ticketRoutes from "./ticketRoutes";
import whatsappRoutes from "./whatsappRoutes";
import messageRoutes from "./messageRoutes";
import whatsappSessionRoutes from "./whatsappSessionRoutes";
import queueRoutes from "./queueRoutes";
import quickAnswerRoutes from "./quickAnswerRoutes";
import apiRoutes from "./apiRoutes";
import botFlowRoutes from "./botFlowRoutes";
import campaignRoutes from "./campaignRoutes";
import senderRoutes from "./senderRoutes";
import campaignClientRoutes from "./campaignClientRoutes";
import apiCampaignClientRoutes from "./apiCampaignClientRoutes";
import gatewayMessageRoutes from "./gatewayMessageRoutes";
import WebHookMetaRoutes from "./WebHookMetaRoutes";
import commercialLeadRoutes from "./commercialLeadRoutes";

const routes = Router();

routes.use(userRoutes);
routes.use("/auth", authRoutes);
routes.use(settingRoutes);
routes.use(contactRoutes);
routes.use(ticketRoutes);
routes.use(whatsappRoutes);
routes.use(messageRoutes);
routes.use(whatsappSessionRoutes);
routes.use(queueRoutes);
routes.use(quickAnswerRoutes);
routes.use("/api/messages", apiRoutes);
routes.use("/api/campaign-clients", apiCampaignClientRoutes);
routes.use("/gateway/messages", gatewayMessageRoutes);
routes.use("/gateway/campaign-clients", apiCampaignClientRoutes);
routes.use("/webhooks/meta", WebHookMetaRoutes);
routes.use("/webhook/meta", WebHookMetaRoutes);
routes.use(botFlowRoutes);
routes.use(campaignRoutes);
routes.use(senderRoutes);
routes.use(campaignClientRoutes);
routes.use(commercialLeadRoutes);

export default routes;
