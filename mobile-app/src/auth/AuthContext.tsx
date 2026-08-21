import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { getMe, login as loginRequest, logout as logoutRequest } from "../api/auth";
import {
  getStoredUser,
  getToken,
  removeRefreshToken,
  removeToken,
  removeUser,
  saveRefreshToken,
  saveToken,
  saveUser
} from "../storage/secureStorage";
import { disconnectCrmSocket } from "../sockets/crmSocket";
import { User } from "../types/crm";
import { subscribeToSession } from "./sessionEvents";

type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(
    () =>
      subscribeToSession(session => {
        setToken(session.token);
        setUser(session.user);
        if (!session.token) {
          disconnectCrmSocket();
        }
      }),
    []
  );

  const refreshUser = useCallback(async () => {
    const currentUser = await getMe();
    setUser(currentUser);
    await saveUser(currentUser);
  }, []);

  useEffect(() => {
    async function hydrate() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          getToken(),
          getStoredUser<User>()
        ]);

        setToken(storedToken);
        setUser(storedUser);

        if (storedToken) {
          await refreshUser();
        }
      } catch {
        await Promise.all([removeToken(), removeRefreshToken(), removeUser()]);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    hydrate();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await loginRequest(email.trim(), password);
    await Promise.all([
      saveToken(response.token),
      saveRefreshToken(response.refreshToken),
      saveUser(response.user)
    ]);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // The local session must be cleared even if the backend is unreachable.
    }

    disconnectCrmSocket();
    await Promise.all([removeToken(), removeRefreshToken(), removeUser()]);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, loading, login, logout, refreshUser }),
    [token, user, loading, login, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
