import { api } from "./client";
import {
  Campaign,
  CampaignClient,
  CampaignMetrics,
  CampaignRecipient,
  CampaignSender,
  CampaignSenderMode
} from "../types/crm";

export type CampaignMedia = {
  uri: string;
  name: string;
  mimeType: string;
};

export type CreateCampaignInput = {
  name: string;
  messageBody: string;
  senderMode: CampaignSenderMode;
  senderId?: number | null;
  ratePerMin?: number | null;
  recipients: { phoneE164: string; name?: string }[];
  media?: CampaignMedia | null;
};

type CampaignClientsResponse = {
  clients: CampaignClient[];
  count: number;
  hasMore: boolean;
};

export async function listCampaigns() {
  const { data } = await api.get<Campaign[]>("/campaigns");
  return data;
}

export async function getCampaign(campaignId: number) {
  const { data } = await api.get<Campaign>(`/campaigns/${campaignId}`);
  return data;
}

export async function getCampaignMetrics(campaignId: number) {
  const { data } = await api.get<CampaignMetrics>(`/campaigns/${campaignId}/metrics`);
  return data;
}

export async function listCampaignRecipients(campaignId: number) {
  const { data } = await api.get<CampaignRecipient[]>(`/campaigns/${campaignId}/recipients`);
  return data;
}

export async function cancelCampaign(campaignId: number) {
  const { data } = await api.post<Campaign>(`/campaigns/${campaignId}/cancel`);
  return data;
}

export async function listCampaignSenders() {
  const { data } = await api.get<CampaignSender[]>("/senders");
  return data;
}

export async function listCampaignClients() {
  const { data } = await api.get<CampaignClientsResponse>("/campaign-clients", {
    params: { pageNumber: "all" }
  });
  return data.clients;
}

async function uploadCampaignMedia(campaignId: number, media: CampaignMedia) {
  const formData = new FormData();
  formData.append("media", {
    uri: media.uri,
    name: media.name,
    type: media.mimeType
  } as unknown as Blob);

  await api.post(`/campaigns/${campaignId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000
  });
}

export async function createAndSendCampaign(input: CreateCampaignInput) {
  const { data: campaign } = await api.post<Campaign>("/campaigns", {
    name: input.name,
    messageBody: input.messageBody,
    senderMode: input.senderMode,
    senderId: input.senderMode === "SINGLE" ? input.senderId : null,
    ratePerMin: input.ratePerMin || null,
    scheduleAt: null
  });

  if (input.media) {
    await uploadCampaignMedia(campaign.id, input.media);
  }

  await api.post(`/campaigns/${campaign.id}/recipients`, input.recipients);
  const { data: readyCampaign } = await api.post<Campaign>(`/campaigns/${campaign.id}/ready`);
  return readyCampaign;
}
