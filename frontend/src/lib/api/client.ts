import axios from "axios";
import { getSession, signOut } from "next-auth/react";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/hms/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Request interceptor — attach access token
apiClient.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.user?.accessToken) {
    config.headers.Authorization = `Bearer ${session.user.accessToken}`;
  }
  return config;
});

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const isLoginRequest = original.url?.includes("/auth/login");

    if (error.response?.status === 401 && !original._retry && !isLoginRequest) {
      original._retry = true;
      // If 401 occurs, it means the session/token is invalid or expired
      // With NextAuth, we should probably sign out or trigger a refresh if we had that logic
      if (typeof window !== "undefined") {
        signOut({ callbackUrl: "/login" });
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
