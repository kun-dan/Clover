import { client } from "./client";
import type { AuthUser } from "@/store/authStore";

export const userApi = {
  getMe: () =>
    client.get<AuthUser & { createdAt: string }>("/api/user/me").then((r) => r.data),

  updateMe: (data: { displayName?: string; avatarUrl?: string }) =>
    client.put<AuthUser>("/api/user/me", data).then((r) => r.data),
};
