import { Router } from "express";
import isAuthApi from "../middleware/isAuthApi";
import * as CampaignClientController from "../controllers/CampaignClientController";

const apiCampaignClientRoutes = Router();

apiCampaignClientRoutes.get("/", isAuthApi, CampaignClientController.index);
apiCampaignClientRoutes.post("/", isAuthApi, CampaignClientController.store);
apiCampaignClientRoutes.get(
  "/:clientId",
  isAuthApi,
  CampaignClientController.show
);
apiCampaignClientRoutes.put(
  "/:clientId",
  isAuthApi,
  CampaignClientController.update
);
apiCampaignClientRoutes.delete(
  "/:clientId",
  isAuthApi,
  CampaignClientController.remove
);

export default apiCampaignClientRoutes;
