import { client } from "./client";

export interface SeriesDto {
  id: string;
  anilistId: number;
  title: string;
  titleRomaji: string | null;
  description: string | null;
  coverUrl: string | null;
  bannerUrl: string | null;
  genres: string[];
  seriesStatus: string | null;
  latestChapter: string | null;
  asurascansSlug: string | null;
  mangaplusId: number | null;
}

export interface ReadingSourceDto {
  id: string;
  provider: string | null;
  url: string;
  label: string;
  isUserDefined: boolean;
}

export interface SearchResult {
  results: SeriesDto[];
  pageInfo: { hasNextPage: boolean; total: number; currentPage: number; lastPage: number };
}

export const seriesApi = {
  search: (q: string, page = 1) =>
    client.get<SearchResult>("/api/search", { params: { q, page } }).then((r) => r.data),

  getById: (id: string) =>
    client.get<SeriesDto>(`/api/series/${id}`).then((r) => r.data),

  getSources: (id: string) =>
    client.get<ReadingSourceDto[]>(`/api/series/${id}/sources`).then((r) => r.data),

  addSource: (id: string, url: string, label: string, provider = "custom") =>
    client.post<ReadingSourceDto>(`/api/series/${id}/sources`, { url, label, provider }).then((r) => r.data),

  deleteSource: (seriesId: string, sourceId: string) =>
    client.delete(`/api/series/${seriesId}/sources/${sourceId}`),
};
