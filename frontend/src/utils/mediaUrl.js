import { getBackendUrl } from "../config";

export const resolveMediaUrl = value => {
  if (!value || typeof value !== "string") {
    return "";
  }

  const mediaUrl = value.trim();

  if (/^(https?:|data:|blob:)/i.test(mediaUrl)) {
    return mediaUrl;
  }

  const path = mediaUrl.startsWith("/")
    ? mediaUrl
    : `/public/${mediaUrl.replace(/^\/+/, "")}`;
  const backendUrl = getBackendUrl();

  if (/^https?:\/\//i.test(backendUrl)) {
    try {
      return new URL(path, new URL(backendUrl).origin).toString();
    } catch (_error) {
      return path;
    }
  }

  return path;
};

