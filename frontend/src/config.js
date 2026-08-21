function getConfig(name, defaultValue = null) {
  // If inside a docker container, use window.ENV
  if (window.ENV !== undefined) {
    return window.ENV[name] || defaultValue;
  }

  return import.meta.env[name] || defaultValue;
}

function isLocalHostname(hostname) {
  return ["localhost", "127.0.0.1", "0.0.0.0"].includes(hostname);
}

function isRunningFromLocalhost() {
  return isLocalHostname(window.location.hostname);
}

function normalizeBackendUrl(value) {
  const backendUrl = value || "/api";

  if (backendUrl.startsWith("/")) {
    return backendUrl;
  }

  try {
    const parsed = new URL(backendUrl, window.location.origin);

    if (isLocalHostname(parsed.hostname) && !isRunningFromLocalhost()) {
      return "/api";
    }

    return backendUrl.replace(/\/+$/, "");
  } catch (_error) {
    return "/api";
  }
}

export function getBackendUrl() {
  return normalizeBackendUrl(getConfig("VITE_BACKEND_URL", "/api"));
}

export function getSalesUrl() {
  return getConfig("VITE_SALES_URL", "");
}

export function getHoursCloseTicketsAuto() {
  return getConfig("VITE_HOURS_CLOSE_TICKETS_AUTO");
}
