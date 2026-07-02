import { NextRequest } from "next/server";
import { searchAniList } from "@/lib/anilist";
import { upsertSeries, seriesToDto } from "@/lib/seriesService";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { badRequest, ok, serverError } from "@/lib/response";

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

  if (!q) return badRequest("Query parameter 'q' is required");

  try {
    const result = await searchAniList(q, page);
    const series = await Promise.all(result.media.map(upsertSeries));
    return ok({
      results: series.map(seriesToDto),
      pageInfo: result.pageInfo,
    });
  } catch (err) {
    console.error("Search error:", err);
    return serverError("Failed to search catalog");
  }
}
