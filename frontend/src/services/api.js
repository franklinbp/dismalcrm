  import axios from "axios";
  import { getBackendUrl } from "../config";

  const api = axios.create({
    baseURL: getBackendUrl(),
    withCredentials: true
  });

  api.interceptors.request.use(config => {
    const raw = localStorage.getItem("token");
    if (raw) {
      let token = raw;
      try {
        token = JSON.parse(raw);
      } catch (_) {}
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  export default api;