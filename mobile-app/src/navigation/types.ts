import { TicketStatus } from "../types/crm";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  TicketDetail: {
    ticketId: number;
    title?: string;
  };
  CampaignComposer: undefined;
  CampaignDetail: {
    campaignId: number;
  };
};

export type MainTabParamList = {
  OpenTickets: undefined;
  PendingTickets: undefined;
  ClosedTickets: undefined;
  Campaigns: undefined;
  Profile: undefined;
};

export type TicketListRouteConfig = {
  status: TicketStatus;
  title: string;
};
