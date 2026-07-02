import { client } from "./client";

export interface UpdateDto {
  id: string;
  isRead: boolean;
  createdAt: string;
  chapter: { id: string; number: string; provider: string; detectedAt: string };
  series: { id: string; title: string; coverUrl: string | null };
}

export const updatesApi = {
  getAll: (unreadOnly = true) =>
    client.get<UpdateDto[]>("/api/updates", { params: { unread: unreadOnly } }).then((r) => r.data),

  markRead: (id: string) =>
    client.put(`/api/updates/${id}/read`),

  markAllRead: () =>
    client.put("/api/updates/read-all"),
};
