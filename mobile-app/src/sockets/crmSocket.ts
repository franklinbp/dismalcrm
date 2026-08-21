import { io, Socket } from "socket.io-client";
import { socketUrl } from "../config/env";

let socket: Socket | null = null;
let socketToken: string | null = null;

export function connectCrmSocket(token: string) {
  if (socket && socketToken === token) {
    return socket;
  }

  socket?.disconnect();
  socketToken = token;

  socket = io(socketUrl, {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    query: { token }
  });

  return socket;
}

export function getCrmSocket() {
  return socket;
}

export function disconnectCrmSocket() {
  socket?.disconnect();
  socket = null;
  socketToken = null;
}
