import { api } from "./client";
import { User } from "../types/crm";

type LoginResponse = {
  token: string;
  refreshToken: string;
  user: User;
};

export async function login(email: string, password: string) {
  const { data } = await api.post<LoginResponse>("/auth/mobile/login", {
    email,
    password
  });

  return data;
}

export async function getMe() {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
}

export async function logout() {
  await api.delete("/auth/mobile/logout");
}
