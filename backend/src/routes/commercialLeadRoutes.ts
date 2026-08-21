import { Router } from "express";
import isAuth from "../middleware/isAuth";
import * as CommercialLeadController from "../controllers/CommercialLeadController";

const commercialLeadRoutes = Router();

commercialLeadRoutes.get("/commercial/leads", isAuth, CommercialLeadController.index);
commercialLeadRoutes.post(
  "/commercial/leads/follow-up-campaign",
  isAuth,
  CommercialLeadController.createFollowUpCampaign
);
commercialLeadRoutes.post(
  "/commercial/leads/from-ticket/:ticketId",
  isAuth,
  CommercialLeadController.createFromTicket
);
commercialLeadRoutes.put(
  "/commercial/leads/:leadId",
  isAuth,
  CommercialLeadController.update
);
commercialLeadRoutes.post(
  "/commercial/leads/:leadId/tasks",
  isAuth,
  CommercialLeadController.createTask
);

export default commercialLeadRoutes;
