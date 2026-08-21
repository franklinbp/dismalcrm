export type TicketStatus = "open" | "pending" | "closed";

export type User = {
  id: number;
  name: string;
  email: string;
  profile?: string;
  companyId?: number;
};

export type Contact = {
  id: number;
  name: string;
  number?: string;
  email?: string;
  profilePicUrl?: string;
};

export type Queue = {
  id: number;
  name: string;
  color?: string;
};

export type Ticket = {
  id: number;
  status: TicketStatus;
  lastMessage?: string;
  unreadMessages?: number;
  updatedAt?: string;
  contact?: Contact;
  queue?: Queue;
  user?: User;
};

export type Message = {
  id: string | number;
  body?: string;
  fromMe: boolean;
  read?: boolean;
  mediaUrl?: string;
  mediaType?: string;
  createdAt?: string;
  ticketId?: number;
};

export type TicketsResponse = {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
};

export type MessagesResponse = {
  messages: Message[];
  ticket: Ticket;
  count: number;
  hasMore: boolean;
};

export type CampaignStatus =
  | "DRAFT"
  | "READY"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELED";

export type CampaignSenderMode = "SINGLE" | "ROUND_ROBIN";

export type CampaignSender = {
  id: number;
  name: string;
  phone?: string;
  whatsappId: number;
  status?: "online" | "offline";
  ratePerMin?: number;
};

export type CampaignClient = {
  id: number;
  name: string;
  tradeName?: string;
  phoneE164: string;
  countryCode?: "EC" | "PE" | string;
  email?: string;
  category?: string;
};

export type Campaign = {
  id: number;
  name: string;
  status: CampaignStatus;
  messageBody: string;
  mediaUrl?: string;
  mediaType?: string;
  senderMode: CampaignSenderMode;
  senderId?: number | null;
  sender?: CampaignSender;
  ratePerMin?: number | null;
  scheduleAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type CampaignRecipient = {
  id: number;
  campaignId: number;
  phoneE164: string;
  name?: string;
  status: "PENDING" | "RETRYING" | "SENT" | "FAILED";
};

export type CampaignMetrics = {
  recipients: {
    total: number;
    pending: number;
    retrying: number;
    sent: number;
    failed: number;
  };
  outbox: {
    pending: number;
    processing: number;
    sent: number;
    failed: number;
  };
};
