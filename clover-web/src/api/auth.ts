import { client } from "./client";

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; displayName: string | null; avatarUrl: string | null };
}

export const authApi = {
  register: (email: string, password: string, displayName?: string) =>
    client.post<TokenResponse>("/api/auth/register", { email, password, displayName }).then((r) => r.data),

  login: (email: string, password: string) =>
    client.post<TokenResponse>("/api/auth/login", { email, password }).then((r) => r.data),

  googleUrl: () => "/api/auth/google",
};
