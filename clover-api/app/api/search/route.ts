import { NextRequest } from "next/server";
import { searchAniList, type SearchSort } from "@/lib/anilist";
import { upsertSeries, seriesToDto } from "@/lib/seriesService";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { badRequest, ok, serverError } from "@/lib/response";

const SORT_VALUES: SearchSort[] = ["relevance", "popularity", "rating", "title"];

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const genre = searchParams.get("genre")?.trim() || undefined;
  const nsfw = searchParams.get("nsfw") === "true";
  const sortParam = searchParams.get("sort");
  const sort = SORT_VALUES.includes(sortParam as SearchSort) ? (sortParam as SearchSort) : "relevance";

  if (!q) return badRequest("Query parameter 'q' is required");

  try {
    const result = await searchAniList(q, page, 20, { genre, nsfw, sort });
    const series = await Promise.all(result.media.map(upsertSeries));
    // Belt-and-suspenders: AniList already excludes adult content server-side when nsfw=false,
    // but guard against stale rows (e.g. upserted previously while nsfw filter was off).
    const results = series
      .map(seriesToDto)
      .filter((s) => nsfw || (!s.isAdult && !s.genres.includes("Hentai")));

    return ok({ results, pageInfo: result.pageInfo });
  } catch (err) {
    console.error("Search error:", err);
    return serverError("Failed to search catalog");
  }
}
