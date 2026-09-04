-- CreateTable
CREATE TABLE "users" (
    "id" BIGSERIAL NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "google_id" VARCHAR(255),
    "display_name" VARCHAR(255),
    "avatar_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series" (
    "id" BIGSERIAL NOT NULL,
    "anilist_id" INTEGER NOT NULL,
    "title" VARCHAR(500) NOT NULL,
    "title_romaji" VARCHAR(500),
    "description" TEXT,
    "cover_url" TEXT,
    "banner_url" TEXT,
    "genres" TEXT,
    "series_status" VARCHAR(50),
    "latest_chapter" DECIMAL(6,1),
    "asurascans_slug" VARCHAR(255),
    "mangaplus_id" VARCHAR(255),
    "updated_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_entries" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "series_id" BIGINT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PLAN_TO_READ',
    "current_chapter" DECIMAL(6,1) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "library_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chapter_updates" (
    "id" BIGSERIAL NOT NULL,
    "series_id" BIGINT NOT NULL,
    "chapter_number" DECIMAL(6,1) NOT NULL,
    "source_provider" VARCHAR(50) NOT NULL,
    "detected_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chapter_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_updates" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "chapter_update_id" BIGINT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reading_sources" (
    "id" BIGSERIAL NOT NULL,
    "series_id" BIGINT NOT NULL,
    "user_id" BIGINT,
    "provider" VARCHAR(50),
    "url" TEXT NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reading_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_google_id_idx" ON "users"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "series_anilist_id_key" ON "series"("anilist_id");

-- CreateIndex
CREATE INDEX "series_anilist_id_idx" ON "series"("anilist_id");

-- CreateIndex
CREATE INDEX "series_asurascans_slug_idx" ON "series"("asurascans_slug");

-- CreateIndex
CREATE INDEX "series_mangaplus_id_idx" ON "series"("mangaplus_id");

-- CreateIndex
CREATE INDEX "library_entries_user_id_idx" ON "library_entries"("user_id");

-- CreateIndex
CREATE INDEX "library_entries_series_id_idx" ON "library_entries"("series_id");

-- CreateIndex
CREATE INDEX "library_entries_user_id_status_idx" ON "library_entries"("user_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "library_entries_user_id_series_id_key" ON "library_entries"("user_id", "series_id");

-- CreateIndex
CREATE INDEX "chapter_updates_series_id_idx" ON "chapter_updates"("series_id");

-- CreateIndex
CREATE INDEX "chapter_updates_detected_at_idx" ON "chapter_updates"("detected_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "chapter_updates_series_id_chapter_number_source_provider_key" ON "chapter_updates"("series_id", "chapter_number", "source_provider");

-- CreateIndex
CREATE INDEX "user_updates_user_id_idx" ON "user_updates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_updates_user_id_chapter_update_id_key" ON "user_updates"("user_id", "chapter_update_id");

-- CreateIndex
CREATE INDEX "reading_sources_series_id_idx" ON "reading_sources"("series_id");

-- CreateIndex
CREATE INDEX "reading_sources_user_id_idx" ON "reading_sources"("user_id");

-- AddForeignKey
ALTER TABLE "library_entries" ADD CONSTRAINT "library_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_entries" ADD CONSTRAINT "library_entries_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chapter_updates" ADD CONSTRAINT "chapter_updates_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_updates" ADD CONSTRAINT "user_updates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_updates" ADD CONSTRAINT "user_updates_chapter_update_id_fkey" FOREIGN KEY ("chapter_update_id") REFERENCES "chapter_updates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_sources" ADD CONSTRAINT "reading_sources_series_id_fkey" FOREIGN KEY ("series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reading_sources" ADD CONSTRAINT "reading_sources_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

