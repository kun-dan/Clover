const ANILIST_URL = "https://graphql.anilist.co";

const SEARCH_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total currentPage lastPage }
      media(search: $search, type: MANGA, format_not_in: [NOVEL]) {
        id
        title { english romaji native }
        description(asHtml: false)
        coverImage { extraLarge large }
        bannerImage
        genres
        status
        chapters
      }
    }
  }
`;

const DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: MANGA) {
      id
      title { english romaji native }
      description(asHtml: false)
      coverImage { extraLarge large }
      bannerImage
      genres
      status
      chapters
    }
  }
`;

export interface AniListMedia {
  id: number;
  title: { english: string | null; romaji: string | null; native: string | null };
  description: string | null;
  coverImage: { extraLarge: string | null; large: string | null };
  bannerImage: string | null;
  genres: string[];
  status: string | null;
  chapters: number | null;
}

export interface AniListSearchResult {
  media: AniListMedia[];
  pageInfo: {
    hasNextPage: boolean;
    total: number;
    currentPage: number;
    lastPage: number;
  };
}

async function gql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const res = await fetch(ANILIST_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 300 }, // cache 5 min in Next.js
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data;
}

export async function searchAniList(
  search: string,
  page = 1,
  perPage = 20
): Promise<AniListSearchResult> {
  const data = await gql<{ Page: { media: AniListMedia[]; pageInfo: AniListSearchResult["pageInfo"] } }>(
    SEARCH_QUERY,
    { search, page, perPage }
  );
  return { media: data.Page.media, pageInfo: data.Page.pageInfo };
}

export async function fetchAniListById(id: number): Promise<AniListMedia> {
  const data = await gql<{ Media: AniListMedia }>(DETAIL_QUERY, { id });
  return data.Media;
}

export function mediaTitle(m: AniListMedia): string {
  return m.title.english ?? m.title.romaji ?? m.title.native ?? "Unknown";
}
