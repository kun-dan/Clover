import { prisma } from "@/lib/db";
import { getProviderNames, resolveProvider } from "@/providers/index";
import { recordChapterIfNewer } from "@/lib/chapterTracking";
import type { ReadingSource, Series } from "@prisma/client";

async function processSource(source: ReadingSource, series: Series) {
  const provider = resolveProvider(source.provider, source.url);
  if (!provider) return;

  try {
    const latest = await provider.fetchLatestChapter(source.url);

    await prisma.readingSource.update({
      where: { id: source.id },
      data: {
        lastCheckedAt: new Date(),
        ...(latest !== null ? { latestChapter: latest } : {}),
      },
    });

    if (latest === null) return;

    const { updated } = await recordChapterIfNewer(series, provider.name, latest);
    if (updated) {
      console.log(`[ChapterUpdateJob] ${series.title}: new chapter ${latest} via ${provider.name}`);
    }
  } catch (err) {
    console.warn(`[ChapterUpdateJob] Error processing ${series.title} via ${provider.name}:`, (err as Error).message);
  }
}

export async function runChapterUpdateJob() {
  console.log("[ChapterUpdateJob] Starting run...");

  const sources = await prisma.readingSource.findMany({
    where: { provider: { in: getProviderNames() } },
    include: { series: true },
    // userId "desc" puts NULL (system-added) rows first within each series group in
    // Postgres, since NULLS FIRST is the default for DESC — matches the dedup
    // preference below (system source wins over duplicate user bookmarks).
    orderBy: [{ seriesId: "asc" }, { userId: "desc" }],
  });

  // Dedupe to one representative source per (seriesId, provider) — prefer the
  // system-added row (userId null) over duplicate user bookmarks for the same
  // provider, since they'd resolve to redundant fetches otherwise.
  const seen = new Set<string>();
  const candidates = sources.filter((s) => {
    const key = `${s.seriesId}:${s.provider}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`[ChapterUpdateJob] Checking ${candidates.length} reading sources`);

  for (const source of candidates) {
    await processSource(source, source.series);
  }

  console.log("[ChapterUpdateJob] Done.");
}
