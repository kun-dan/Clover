import { prisma } from "./db";
import { resolveProvider } from "@/providers/index";
import type { Series, ReadingSource } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const STALE_AFTER_MS = 60_000;

// Inserts a ChapterUpdate (idempotent via its unique constraint) and fans out
// UserUpdate rows to every non-DROPPED subscriber, then bumps Series.latestChapter.
// Shared by the background job and the live per-request refresh path so both stay
// in sync on exactly one notification pipeline.
export async function recordChapterIfNewer(
  series: Series,
  providerName: string,
  freshChapter: Decimal
): Promise<{ series: Series; updated: boolean }> {
  const current = series.latestChapter;
  if (current !== null && !freshChapter.greaterThan(current)) return { series, updated: false };

  let chapterUpdate;
  try {
    chapterUpdate = await prisma.chapterUpdate.create({
      data: {
        seriesId: series.id,
        chapterNumber: freshChapter,
        sourceProvider: providerName,
      },
    });
  } catch {
    // Unique constraint violation — another call already recorded this chapter.
    return { series, updated: false };
  }

  await prisma.$executeRaw`
    INSERT INTO user_updates (user_id, chapter_update_id, is_read, created_at)
    SELECT le.user_id, ${chapterUpdate.id}, false, NOW()
    FROM library_entries le
    WHERE le.series_id = ${series.id}
      AND le.status != 'DROPPED'
    ON CONFLICT (user_id, chapter_update_id) DO NOTHING
  `;

  const updatedSeries = await prisma.series.update({
    where: { id: series.id },
    data: { latestChapter: freshChapter },
  });
  return { series: updatedSeries, updated: true };
}

// Pings a ReadingSource's provider for the latest chapter, at most once per
// STALE_AFTER_MS, and records any newer chapter found. Used by the series detail
// route so reloading the page refreshes the tracked source's chapter live.
export async function refreshLiveSource(source: ReadingSource, series: Series): Promise<{ source: ReadingSource; series: Series }> {
  if (source.lastCheckedAt && Date.now() - source.lastCheckedAt.getTime() < STALE_AFTER_MS) {
    return { source, series };
  }

  const provider = resolveProvider(source.provider, source.url);
  if (!provider) {
    const stamped = await prisma.readingSource.update({
      where: { id: source.id },
      data: { lastCheckedAt: new Date() },
    });
    return { source: stamped, series };
  }

  const latest = await provider.fetchLatestChapter(source.url);

  const updatedSource = await prisma.readingSource.update({
    where: { id: source.id },
    data: {
      lastCheckedAt: new Date(),
      ...(latest !== null ? { latestChapter: latest } : {}),
    },
  });

  if (latest === null) {
    return { source: updatedSource, series };
  }

  const { series: updatedSeries } = await recordChapterIfNewer(series, provider.name, latest);
  return { source: updatedSource, series: updatedSeries };
}
