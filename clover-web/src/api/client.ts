import axios from "axios";
import { useAuthStore } from "@/store/authStore";

export const client = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

// Attach access token
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token queue pattern
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const { refreshToken, setTokens, logout, user } = useAuthStore.getState();
      // Guests never had a login of their own to return to — send them back into
      // the app so ProtectedRoute transparently provisions a fresh guest session.
      const fallbackPath = user?.isGuest ? "/dashboard" : "/login";

      if (!refreshToken) {
        logout();
        window.location.href = fallbackPath;
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return client(original);
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post("/api/auth/refresh", { refreshToken });
        setTokens(data.accessToken, data.refreshToken);
        processQueue(null, data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return client(original);
      } catch (err) {
        processQueue(err, null);
        logout();
        window.location.href = fallbackPath;
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
