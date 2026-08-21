import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CampaignClientController from "../controllers/CampaignClientController";

const campaignClientRoutes = Router();

campaignClientRoutes.get("/campaign-clients", isAuth, CampaignClientController.index);
campaignClientRoutes.post("/campaign-clients", isAuth, CampaignClientController.store);
campaignClientRoutes.get(
  "/campaign-clients/:clientId",
  isAuth,
  CampaignClientController.show
);
campaignClientRoutes.put(
  "/campaign-clients/:clientId",
  isAuth,
  CampaignClientController.update
);
campaignClientRoutes.delete(
  "/campaign-clients/:clientId",
  isAuth,
  CampaignClientController.remove
);

export default campaignClientRoutes;
