import { Router } from "express";

import * as BotFlowController from "../controllers/BotFlowController";
import isAuth from "../middleware/isAuth";

const botFlowRoutes = Router();

botFlowRoutes.get("/bot-flows", isAuth, BotFlowController.index);
botFlowRoutes.get(
  "/bot-flows/runtime/status",
  isAuth,
  BotFlowController.runtimeStatus
);
botFlowRoutes.get(
  "/bot-flows/runtime/executions",
  isAuth,
  BotFlowController.runtimeExecutions
);
botFlowRoutes.post("/bot-flows/demo", isAuth, BotFlowController.createDemo);
botFlowRoutes.put("/bot-flows/:flowId", isAuth, BotFlowController.update);
botFlowRoutes.post(
  "/bot-flows/:flowId/nodes",
  isAuth,
  BotFlowController.createNode
);
botFlowRoutes.get(
  "/bot-flows/:flowId/rules",
  isAuth,
  BotFlowController.listRules
);
botFlowRoutes.post(
  "/bot-flows/:flowId/rules/defaults",
  isAuth,
  BotFlowController.installDefaultRules
);
botFlowRoutes.post(
  "/bot-flows/:flowId/rules",
  isAuth,
  BotFlowController.upsertRule
);
botFlowRoutes.put(
  "/bot-flows/:flowId/rules/:ruleId",
  isAuth,
  BotFlowController.upsertRule
);
botFlowRoutes.put(
  "/bot-flows/nodes/:nodeId",
  isAuth,
  BotFlowController.updateNode
);
botFlowRoutes.post(
  "/bot-flows/:flowId/observe",
  isAuth,
  BotFlowController.observe
);
botFlowRoutes.post(
  "/bot-flows/:flowId/simulate",
  isAuth,
  BotFlowController.simulate
);

export default botFlowRoutes;
