import { AxiosError, create, InternalAxiosRequestConfig } from "axios";
import { apiUrl } from "../config/env";
import { publishSession } from "../auth/sessionEvents";
import {
  getRefreshToken,
  getToken,
  removeRefreshToken,
  removeToken,
  removeUser,
  saveRefreshToken,
  saveToken,
  saveUser
} from "../storage/secureStorage";
import { User } from "../types/crm";

export const api = create({
  baseURL: apiUrl,
  timeout: 20000,
  withCredentials: true
});

const refreshApi = create({
  baseURL: apiUrl,
  timeout: 20000
});

type RetriableRequest = InternalAxiosRequestConfig & {
  _sessionRetry?: boolean;
};

type MobileRefreshResponse = {
  token: string;
  refreshToken: string;
  user: User;
};

let refreshRequest: Promise<MobileRefreshResponse> | null = null;

api.interceptors.request.use(async config => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

async function clearLocalSession() {
  await Promise.all([removeToken(), removeRefreshToken(), removeUser()]);
  publishSession({ token: null, user: null });
}

async function renewSession() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    throw new Error("Missing mobile refresh token");
  }

  const { data } = await refreshApi.post<MobileRefreshResponse>(
    "/auth/mobile/refresh",
    { refreshToken }
  );

  await Promise.all([
    saveToken(data.token),
    saveRefreshToken(data.refreshToken),
    saveUser(data.user)
  ]);
  publishSession({ token: data.token, user: data.user });

  return data;
}

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const request = error.config as RetriableRequest | undefined;
    const excludedAuthRequest = [
      "/auth/login",
      "/auth/mobile/login",
      "/auth/mobile/refresh",
      "/auth/logout",
      "/auth/mobile/logout"
    ].some(path => request?.url?.includes(path));

    if (
      ![401, 403].includes(error.response?.status || 0) ||
      !request ||
      request._sessionRetry ||
      excludedAuthRequest
    ) {
      return Promise.reject(error);
    }

    request._sessionRetry = true;

    try {
      if (!refreshRequest) {
        refreshRequest = renewSession().finally(() => {
          refreshRequest = null;
        });
      }

      const session = await refreshRequest;
      request.headers.Authorization = `Bearer ${session.token}`;
      return api.request(request);
    } catch (refreshError) {
      await clearLocalSession();
      return Promise.reject(refreshError);
    }
  }
);

export function getMediaUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const apiOrigin = new URL(apiUrl).origin;
  return `${apiOrigin}/${path.replace(/^\/+/, "")}`;
}
