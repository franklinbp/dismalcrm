import { Router } from "express";

import * as GatewayMessageController from "../controllers/GatewayMessageController";
import isAuthApi from "../middleware/isAuthApi";

const gatewayMessageRoutes = Router();

gatewayMessageRoutes.post("/send", isAuthApi, GatewayMessageController.send);

export default gatewayMessageRoutes;
