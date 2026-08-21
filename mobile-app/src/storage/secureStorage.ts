import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "dismalcrm.token";
const REFRESH_TOKEN_KEY = "dismalcrm.refreshToken";
const USER_KEY = "dismalcrm.user";

export async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function saveRefreshToken(token: string) {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

export async function getRefreshToken() {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function removeRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function saveUser(user: unknown) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser<T>() {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function removeUser() {
  await SecureStore.deleteItemAsync(USER_KEY);
}
