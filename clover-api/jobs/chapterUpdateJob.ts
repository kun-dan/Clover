import { prisma } from "@/lib/db";
import { AsuraScansProvider } from "@/providers/asurascans";
import { MangaPlusProvider } from "@/providers/mangaplus";
import type { MangaProvider } from "@/providers/index";
import type { Series } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const providers: MangaProvider[] = [
  new AsuraScansProvider(),
  new MangaPlusProvider(),
];

async function processSeriesForProvider(series: Series, provider: MangaProvider) {
  try {
    const latest = await provider.fetchLatestChapter(series);
    if (latest === null) return;

    const current = series.latestChapter;
    if (current !== null && !latest.greaterThan(current)) return;

    // Insert chapter update (idempotent via unique constraint)
    let chapterUpdate;
    try {
      chapterUpdate = await prisma.chapterUpdate.create({
        data: {
          seriesId: series.id,
          chapterNumber: latest,
          sourceProvider: provider.name,
        },
      });
    } catch {
      // Unique constraint violation — already detected
      return;
    }

    // Fan-out: bulk insert user_updates for all non-DROPPED subscribers
    await prisma.$executeRaw`
      INSERT INTO user_updates (user_id, chapter_update_id, is_read, created_at)
      SELECT le.user_id, ${chapterUpdate.id}, false, NOW()
      FROM library_entries le
      WHERE le.series_id = ${series.id}
        AND le.status != 'DROPPED'
      ON CONFLICT (user_id, chapter_update_id) DO NOTHING
    `;

    // Update series latest chapter
    await prisma.series.update({
      where: { id: series.id },
      data: { latestChapter: latest },
    });

    console.log(`[ChapterUpdateJob] ${series.title}: new chapter ${latest} via ${provider.name}`);
  } catch (err) {
    console.warn(`[ChapterUpdateJob] Error processing ${series.title} via ${provider.name}:`, (err as Error).message);
  }
}

export async function runChapterUpdateJob() {
  console.log("[ChapterUpdateJob] Starting run...");

  const candidates = await prisma.series.findMany({
    where: {
      OR: [
        { asurascansSlug: { not: null } },
        { mangaplusId: { not: null } },
      ],
    },
  });

  console.log(`[ChapterUpdateJob] Checking ${candidates.length} series`);

  for (const series of candidates) {
    for (const provider of providers) {
      await processSeriesForProvider(series, provider);
    }
  }

  console.log("[ChapterUpdateJob] Done.");
}
