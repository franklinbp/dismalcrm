import { useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

import openSocket from "../../services/socket-io";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const readStoredToken = () => {
  const rawToken = localStorage.getItem("token");

  if (!rawToken) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawToken);
    return parsed || null;
  } catch (_error) {
    // Backward compatibility: older builds stored token as raw string.
    return rawToken;
  }
};

let refreshRequest = null;

const renewAccessToken = async () => {
  if (!refreshRequest) {
    refreshRequest = api
      .post("/auth/refresh_token")
      .then(({ data }) => {
        if (!data?.token) {
          throw new Error("Refresh token response did not include an access token");
        }

        localStorage.setItem("token", JSON.stringify(data.token));
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        return data;
      })
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
};

const useAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});

  const requestInterceptorRef = useRef(null);
  const responseInterceptorRef = useRef(null);

  const clearSession = () => {
    localStorage.removeItem("token");
    api.defaults.headers.Authorization = undefined;
    setIsAuth(false);
    setUser({});
  };

  useEffect(() => {
    requestInterceptorRef.current = api.interceptors.request.use(
      config => {
        const token = readStoredToken();

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
      },
      error => Promise.reject(error)
    );

    responseInterceptorRef.current = api.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error?.config || {};
        const status = error?.response?.status;

        if (
          status === 403 &&
          !originalRequest._retry &&
          !String(originalRequest.url || "").includes("/auth/refresh_token")
        ) {
          originalRequest._retry = true;

          try {
            const data = await renewAccessToken();
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${data.token}`;

            return api(originalRequest);
          } catch (refreshError) {
            clearSession();
            history.replace("/login");
            return Promise.reject(refreshError);
          }
        }

        if (status === 401) {
          clearSession();
        }

        return Promise.reject(error);
      }
    );

    return () => {
      if (requestInterceptorRef.current !== null) {
        api.interceptors.request.eject(requestInterceptorRef.current);
      }
      if (responseInterceptorRef.current !== null) {
        api.interceptors.response.eject(responseInterceptorRef.current);
      }
    };
  }, [history]);

  useEffect(() => {
    const token = readStoredToken();

    (async () => {
      if (token) {
        try {
          const data = await renewAccessToken();
          setIsAuth(true);
          setUser(data.user);
        } catch (err) {
          clearSession();
          toastError(err);
        }
      }

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!isAuth || !user?.id) {
      return undefined;
    }

    const socket = openSocket();

    if (!socket) {
      return undefined;
    }

    socket.on("user", data => {
      if (data.action === "update" && data.user.id === user.id) {
        setUser(data.user);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuth, user?.id]);

  const handleLogin = async userData => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", userData);
      localStorage.setItem("token", JSON.stringify(data.token));
      api.defaults.headers.Authorization = `Bearer ${data.token}`;
      setUser(data.user);
      setIsAuth(true);
      toast.success(i18n.t("auth.toasts.success"));
      history.push("/tickets");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);

    try {
      await api.delete("/auth/logout");
      setIsAuth(false);
      setUser({});
      localStorage.removeItem("token");
      api.defaults.headers.Authorization = undefined;
      history.push("/login");
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const { data } = await api.get("/auth/me");
      return data;
    } catch (err) {
      toastError(err);
      return null;
    }
  };

  return { isAuth, user, loading, handleLogin, handleLogout, getCurrentUserInfo };
};

export default useAuth;
