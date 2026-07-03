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
  rating: string | null;
  isAdult: boolean;
  selectedSource: ReadingSourceDto | null;
}

export interface ReadingSourceDto {
  id: string;
  provider: string | null;
  url: string;
  label: string;
  isUserDefined: boolean;
  latestChapter: string | null;
  lastCheckedAt: string | null;
}

export interface SearchResult {
  results: SeriesDto[];
  pageInfo: { hasNextPage: boolean; total: number; currentPage: number; lastPage: number };
}

export type SearchSort = "relevance" | "popularity" | "rating" | "title";

export interface SearchFilters {
  genre?: string;
  sort?: SearchSort;
  nsfw?: boolean;
}

export const seriesApi = {
  search: (q: string, page = 1, filters: SearchFilters = {}) =>
    client
      .get<SearchResult>("/api/search", {
        params: { q, page, genre: filters.genre, sort: filters.sort, nsfw: filters.nsfw },
      })
      .then((r) => r.data),

  getById: (id: string) =>
    client.get<SeriesDto>(`/api/series/${id}`).then((r) => r.data),

  getSources: (id: string) =>
    client.get<ReadingSourceDto[]>(`/api/series/${id}/sources`).then((r) => r.data),

  addSource: (id: string, url: string, label: string, provider = "custom") =>
    client.post<ReadingSourceDto>(`/api/series/${id}/sources`, { url, label, provider }).then((r) => r.data),

  deleteSource: (seriesId: string, sourceId: string) =>
    client.delete(`/api/series/${seriesId}/sources/${sourceId}`),
};
