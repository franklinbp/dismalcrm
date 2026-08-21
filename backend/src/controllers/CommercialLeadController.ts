import { Request, Response } from "express";

import CommercialLeadStatsService from "../services/CommercialLeadServices/CommercialLeadStatsService";
import CreateCommercialFollowUpCampaignService from "../services/CommercialLeadServices/CreateCommercialFollowUpCampaignService";
import CreateCommercialLeadFromTicketService from "../services/CommercialLeadServices/CreateCommercialLeadFromTicketService";
import CreateCommercialLeadTaskService from "../services/CommercialLeadServices/CreateCommercialLeadTaskService";
import ListCommercialLeadsService from "../services/CommercialLeadServices/ListCommercialLeadsService";
import SyncCommercialLeadsFromTicketsService from "../services/CommercialLeadServices/SyncCommercialLeadsFromTicketsService";
import UpdateCommercialLeadService from "../services/CommercialLeadServices/UpdateCommercialLeadService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, status, customerType } = req.query;

  const sync = await SyncCommercialLeadsFromTicketsService();

  const [leads, stats] = await Promise.all([
    ListCommercialLeadsService({
      searchParam: searchParam as string,
      status: status as string,
      customerType: customerType as string
    }),
    CommercialLeadStatsService()
  ]);

  return res.status(200).json({ leads, stats, sync });
};

export const createFromTicket = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;

  const result = await CreateCommercialLeadFromTicketService(ticketId);

  return res.status(result.created ? 201 : 200).json(result);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { leadId } = req.params;

  const lead = await UpdateCommercialLeadService({
    leadId,
    data: req.body
  });

  return res.status(200).json(lead);
};

export const createTask = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { leadId } = req.params;
  const { title, dueAt, priority, notes } = req.body;

  const task = await CreateCommercialLeadTaskService({
    leadId,
    title,
    dueAt,
    priority,
    notes
  });

  return res.status(201).json(task);
};

export const createFollowUpCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const result = await CreateCommercialFollowUpCampaignService({
    ...req.body,
    companyId: Number((req as any).user?.companyId) || undefined
  });

  return res.status(201).json(result);
};
