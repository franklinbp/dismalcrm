import { Request, Response } from "express";

import AppError from "../errors/AppError";
import CreateBotNodeService from "../services/BotFlowServices/CreateBotNodeService";
import CreateDefaultBotFlowService from "../services/BotFlowServices/CreateDefaultBotFlowService";
import CreateDefaultBotRulesService from "../services/BotFlowServices/CreateDefaultBotRulesService";
import GetBotRuntimeStatusService from "../services/BotFlowServices/GetBotRuntimeStatusService";
import ListBotFlowsService from "../services/BotFlowServices/ListBotFlowsService";
import ListBotExecutionsService from "../services/BotFlowServices/ListBotExecutionsService";
import ListBotRulesService from "../services/BotFlowServices/ListBotRulesService";
import ObserveBotMasterMessageService from "../services/BotFlowServices/ObserveBotMasterMessageService";
import SimulateBotFlowService from "../services/BotFlowServices/SimulateBotFlowService";
import UpdateBotFlowService from "../services/BotFlowServices/UpdateBotFlowService";
import UpdateBotNodeService from "../services/BotFlowServices/UpdateBotNodeService";
import UpsertBotRuleService from "../services/BotFlowServices/UpsertBotRuleService";

const getCompanyId = (req: Request): number => {
  const companyId = Number((req as any).user?.companyId);

  if (!companyId) {
    throw new AppError("Empresa no encontrada para automatizaciones", 400);
  }

  return companyId;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const flows = await ListBotFlowsService({
    companyId: getCompanyId(req)
  });

  return res.status(200).json({ flows });
};

export const runtimeStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const status = await GetBotRuntimeStatusService({
    companyId: getCompanyId(req)
  });

  return res.status(200).json(status);
};

export const runtimeExecutions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const executions = await ListBotExecutionsService({
    companyId: getCompanyId(req),
    limit: Number(req.query.limit || 20)
  });

  return res.status(200).json({ executions });
};

export const createDemo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const flow = await CreateDefaultBotFlowService({
    companyId: getCompanyId(req)
  });

  return res.status(201).json(flow);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { flowId } = req.params;

  const flow = await UpdateBotFlowService({
    flowId,
    companyId: getCompanyId(req),
    data: req.body
  });

  return res.status(200).json(flow);
};

export const createNode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { flowId } = req.params;

  const node = await CreateBotNodeService({
    flowId,
    companyId: getCompanyId(req),
    data: req.body
  });

  return res.status(201).json(node);
};

export const updateNode = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { nodeId } = req.params;

  const node = await UpdateBotNodeService({
    nodeId,
    companyId: getCompanyId(req),
    data: req.body
  });

  return res.status(200).json(node);
};

export const listRules = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { flowId } = req.params;

  const rules = await ListBotRulesService({
    flowId,
    companyId: getCompanyId(req)
  });

  return res.status(200).json({ rules });
};

export const installDefaultRules = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { flowId } = req.params;

  const rules = await CreateDefaultBotRulesService({
    flowId,
    companyId: getCompanyId(req)
  });

  return res.status(201).json({ rules });
};

export const upsertRule = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { flowId, ruleId } = req.params;

  const rule = await UpsertBotRuleService({
    flowId,
    ruleId,
    companyId: getCompanyId(req),
    data: req.body
  });

  return res.status(ruleId ? 200 : 201).json(rule);
};

export const observe = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { flowId } = req.params;
  const { messageBody, contactName, channel } = req.body;

  if (!messageBody) {
    throw new AppError("Mensaje requerido para observar BotMaster", 400);
  }

  const result = await ObserveBotMasterMessageService({
    flowId,
    companyId: getCompanyId(req),
    messageBody,
    contactName,
    channel
  });

  return res.status(200).json(result);
};

export const simulate = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { flowId } = req.params;
  const { messageBody, contactName, channel } = req.body;

  if (!messageBody) {
    throw new AppError("Mensaje requerido para simular el flujo", 400);
  }

  const result = await SimulateBotFlowService({
    flowId,
    companyId: getCompanyId(req),
    messageBody,
    contactName,
    channel
  });

  return res.status(200).json(result);
};
