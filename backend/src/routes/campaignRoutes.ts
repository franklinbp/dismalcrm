import { Router } from "express";
import multer from "multer";
import isAuth from "../middleware/isAuth";
import * as CampaignController from "../controllers/CampaignController";
import uploadConfig from "../config/upload";

const campaignRoutes = Router();
const upload = multer(uploadConfig);

campaignRoutes.get("/campaigns", isAuth, CampaignController.index);
campaignRoutes.post("/campaigns", isAuth, CampaignController.store);
campaignRoutes.get("/campaigns/:campaignId", isAuth, CampaignController.show);
campaignRoutes.put("/campaigns/:campaignId", isAuth, CampaignController.update);
campaignRoutes.post(
  "/campaigns/:campaignId/media",
  isAuth,
  upload.single("media"),
  CampaignController.uploadMedia
);

campaignRoutes.post(
  "/campaigns/:campaignId/recipients",
  isAuth,
  CampaignController.importRecipients
);

campaignRoutes.get(
  "/campaigns/:campaignId/recipients",
  isAuth,
  CampaignController.listRecipients
);

campaignRoutes.post(
  "/campaigns/:campaignId/preview",
  isAuth,
  CampaignController.preview
);

campaignRoutes.post(
  "/campaigns/:campaignId/ready",
  isAuth,
  CampaignController.ready
);

campaignRoutes.post(
  "/campaigns/:campaignId/cancel",
  isAuth,
  CampaignController.cancel
);

campaignRoutes.post(
  "/campaigns/:campaignId/duplicate",
  isAuth,
  CampaignController.duplicate
);

campaignRoutes.delete(
  "/campaigns/:campaignId",
  isAuth,
  CampaignController.destroy
);

campaignRoutes.get(
  "/campaigns/:campaignId/metrics",
  isAuth,
  CampaignController.metrics
);

export default campaignRoutes;
