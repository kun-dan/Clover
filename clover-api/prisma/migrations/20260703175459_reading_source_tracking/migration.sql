-- DropIndex
DROP INDEX "series_asurascans_slug_idx";

-- DropIndex
DROP INDEX "series_mangaplus_id_idx";

-- AlterTable
ALTER TABLE "library_entries" ADD COLUMN     "selected_source_id" BIGINT;

-- AlterTable
ALTER TABLE "reading_sources" ADD COLUMN     "last_checked_at" TIMESTAMPTZ,
ADD COLUMN     "latest_chapter" DECIMAL(6,1);

-- Backfill: preserve any existing per-series provider links as system ReadingSource
-- rows before the ad-hoc series.asurascans_slug / series.mangaplus_id columns are
-- dropped. Guarded with NOT EXISTS so this is safe to run more than once and is a
-- no-op if nothing was ever set on those columns.
INSERT INTO "reading_sources" (series_id, user_id, provider, url, label, created_at)
SELECT id, NULL, 'asurascans', 'https://asurascans.com/comics/' || asurascans_slug, 'AsuraScans', NOW()
FROM "series"
WHERE asurascans_slug IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "reading_sources" rs
    WHERE rs.series_id = "series".id AND rs.provider = 'asurascans' AND rs.user_id IS NULL
  );

INSERT INTO "reading_sources" (series_id, user_id, provider, url, label, created_at)
SELECT id, NULL, 'mangaplus', 'https://mangaplus.shueisha.co.jp/titles/' || mangaplus_id, 'MangaPlus', NOW()
FROM "series"
WHERE mangaplus_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "reading_sources" rs
    WHERE rs.series_id = "series".id AND rs.provider = 'mangaplus' AND rs.user_id IS NULL
  );

-- AlterTable
ALTER TABLE "series" DROP COLUMN "asurascans_slug",
DROP COLUMN "mangaplus_id";

-- CreateIndex
CREATE INDEX "library_entries_selected_source_id_idx" ON "library_entries"("selected_source_id");

-- AddForeignKey
ALTER TABLE "library_entries" ADD CONSTRAINT "library_entries_selected_source_id_fkey" FOREIGN KEY ("selected_source_id") REFERENCES "reading_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
