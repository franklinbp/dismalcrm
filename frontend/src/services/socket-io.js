import openSocket from "socket.io-client";
import { getBackendUrl } from "../config";

function getSocketBaseUrl() {
  const backendUrl = getBackendUrl();

  if (!backendUrl || backendUrl.startsWith("/")) {
    return undefined;
  }

  try {
    const parsed = new URL(backendUrl, window.location.origin);
    return parsed.origin;
  } catch (_error) {
    return undefined;
  }
}

function getStoredToken() {
  const rawToken = localStorage.getItem("token");

  if (!rawToken) {
    return null;
  }

  try {
    const parsedToken = JSON.parse(rawToken);
    return parsedToken || null;
  } catch (_error) {
    // Backward compatibility: older builds stored token as raw string.
    return rawToken;
  }
}

function createInactiveSocket() {
  return {
    on: () => {},
    off: () => {},
    emit: () => {},
    disconnect: () => {},
    connected: false
  };
}

function connectToSocket() {
  const token = getStoredToken();

  if (!token) {
    return createInactiveSocket();
  }

  return openSocket(getSocketBaseUrl(), {
    path: "/socket.io",
    transports: ["polling", "websocket"],
    query: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000
  });
}

export default connectToSocket;
