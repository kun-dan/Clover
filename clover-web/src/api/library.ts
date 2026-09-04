import { client } from "./client";

/** Single source of truth for reading statuses. Order here is the order they
 *  appear in the UI (status dropdown, dashboard tabs). */
export const LIBRARY_STATUSES = ["READING", "PLAN_TO_READ", "COMPLETED", "DROPPED"] as const;

export type LibraryStatus = (typeof LIBRARY_STATUSES)[number];

export const STATUS_LABELS: Record<LibraryStatus, string> = {
  READING: "Reading",
  PLAN_TO_READ: "Plan to Read",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
};

export interface LibraryEntryDto {
  id: string;
  seriesId: string;
  status: LibraryStatus;
  currentChapter: string;
  selectedSourceId: string | null;
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

  update: (seriesId: string, data: { status?: LibraryStatus; currentChapter?: number; selectedSourceId?: string | null }) =>
    client.put<LibraryEntryDto>(`/api/library/${seriesId}`, data).then((r) => r.data),

  remove: (seriesId: string) =>
    client.delete(`/api/library/${seriesId}`),
};
