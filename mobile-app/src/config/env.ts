const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

function readPublicUrl(value: string | undefined, name: string, fallback?: string) {
  const resolved = trimTrailingSlash(value || fallback || "");

  if (!resolved) {
    throw new Error(`${name} is required`);
  }

  let parsed: URL;
  try {
    parsed = new URL(resolved);
  } catch {
    throw new Error(`${name} must be a valid absolute URL`);
  }

  if (!__DEV__ && parsed.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS in production`);
  }

  return resolved;
}

export const apiUrl = readPublicUrl(
  process.env.EXPO_PUBLIC_API_URL,
  "EXPO_PUBLIC_API_URL",
  __DEV__ ? "http://localhost:8081" : undefined
);

export const socketUrl = readPublicUrl(
  process.env.EXPO_PUBLIC_SOCKET_URL,
  "EXPO_PUBLIC_SOCKET_URL",
  apiUrl
);
