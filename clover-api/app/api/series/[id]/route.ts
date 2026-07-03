import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthUser, requireAuth } from "@/lib/auth";
import { notFound, ok, serverError } from "@/lib/response";
import { seriesToDto } from "@/lib/seriesService";
import { refreshLiveSource } from "@/lib/chapterTracking";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getAuthUser(req);
  const authError = requireAuth(user);
  if (authError) return authError;

  try {
    let series = await prisma.series.findUnique({ where: { id: BigInt(params.id) } });
    if (!series) return notFound("Series not found");

    const entry = await prisma.libraryEntry.findUnique({
      where: { userId_seriesId: { userId: BigInt(user!.userId), seriesId: series.id } },
      include: { selectedSource: true },
    });

    let selectedSource = entry?.selectedSource ?? null;
    if (selectedSource) {
      const refreshed = await refreshLiveSource(selectedSource, series);
      selectedSource = refreshed.source;
      series = refreshed.series;
    }

    return ok({
      ...seriesToDto(series),
      selectedSource: selectedSource
        ? {
            id: selectedSource.id.toString(),
            provider: selectedSource.provider,
            url: selectedSource.url,
            label: selectedSource.label,
            isUserDefined: selectedSource.userId !== null,
            latestChapter: selectedSource.latestChapter ? selectedSource.latestChapter.toString() : null,
            lastCheckedAt: selectedSource.lastCheckedAt,
          }
        : null,
    });
  } catch {
    return serverError();
  }
}
