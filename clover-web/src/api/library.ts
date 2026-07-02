import { client } from "./client";

export type LibraryStatus = "READING" | "COMPLETED" | "DROPPED" | "PLAN_TO_READ";

export interface LibraryEntryDto {
  id: string;
  seriesId: string;
  status: LibraryStatus;
  currentChapter: string;
  updatedAt: string;
  series: {
    id: string;
    title: string;
    coverUrl: string | null;
    latestChapter: string | null;
    seriesStatus: string | null;
  };
}

export const libraryApi = {
  getAll: (status?: LibraryStatus) =>
    client.get<LibraryEntryDto[]>("/api/library", { params: status ? { status } : {} }).then((r) => r.data),

  add: (seriesId: string, status: LibraryStatus = "PLAN_TO_READ", currentChapter = 0) =>
    client.post<LibraryEntryDto>("/api/library", { seriesId, status, currentChapter }).then((r) => r.data),

  update: (seriesId: string, data: { status?: LibraryStatus; currentChapter?: number }) =>
    client.put<LibraryEntryDto>(`/api/library/${seriesId}`, data).then((r) => r.data),

  remove: (seriesId: string) =>
    client.delete(`/api/library/${seriesId}`),
};
