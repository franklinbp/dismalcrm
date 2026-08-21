import { api } from "./client";
import {
  Message,
  MessagesResponse,
  Ticket,
  TicketStatus,
  TicketsResponse
} from "../types/crm";

export async function listTickets(status: TicketStatus, pageNumber = 1) {
  const { data } = await api.get<TicketsResponse>("/tickets", {
    params: {
      status,
      pageNumber
    }
  });

  return data;
}

export async function getTicket(ticketId: number) {
  const { data } = await api.get<Ticket>(`/tickets/${ticketId}`);
  return data;
}

export async function updateTicketStatus(ticketId: number, status: TicketStatus) {
  const { data } = await api.put<Ticket>(`/tickets/${ticketId}`, { status });
  return data;
}

export async function listMessages(ticketId: number, pageNumber = 1) {
  const { data } = await api.get<MessagesResponse>(`/messages/${ticketId}`, {
    params: { pageNumber }
  });

  return data;
}

export async function sendTextMessage(ticketId: number, body: string) {
  await api.post(`/messages/${ticketId}`, { body });
}

export type UploadableMedia = {
  uri: string;
  name: string;
  mimeType: string;
};

export async function sendMediaMessage(ticketId: number, media: UploadableMedia) {
  const formData = new FormData();

  formData.append("medias", {
    uri: media.uri,
    name: media.name,
    type: media.mimeType
  } as unknown as Blob);

  await api.post(`/messages/${ticketId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000
  });
}

export function mergeMessage(messages: Message[], incoming: Message) {
  const exists = messages.some(message => String(message.id) === String(incoming.id));
  return exists
    ? messages.map(message => (String(message.id) === String(incoming.id) ? incoming : message))
    : [...messages, incoming];
}
