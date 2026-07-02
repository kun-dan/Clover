import { prisma } from "./db";
import { type AniListMedia, mediaTitle } from "./anilist";
import type { Series } from "@prisma/client";

export function seriesFromAniList(media: AniListMedia): Omit<Series, "id" | "createdAt" | "updatedAt" | "asurascansSlug" | "mangaplusId" | "latestChapter"> {
  return {
    anilistId: media.id,
    title: mediaTitle(media),
    titleRomaji: media.title.romaji,
    description: media.description,
    coverUrl: media.coverImage.extraLarge ?? media.coverImage.large,
    bannerUrl: media.bannerImage,
    genres: JSON.stringify(media.genres ?? []),
    seriesStatus: media.status,
  };
}

export async function upsertSeries(media: AniListMedia): Promise<Series> {
  const data = seriesFromAniList(media);
  return prisma.series.upsert({
    where: { anilistId: media.id },
    update: {
      title: data.title,
      titleRomaji: data.titleRomaji,
      description: data.description,
      coverUrl: data.coverUrl,
      bannerUrl: data.bannerUrl,
      genres: data.genres,
      seriesStatus: data.seriesStatus,
    },
    create: data,
  });
}

export function seriesToDto(s: Series) {
  return {
    id: s.id.toString(),
    anilistId: s.anilistId,
    title: s.title,
    titleRomaji: s.titleRomaji,
    description: s.description,
    coverUrl: s.coverUrl,
    bannerUrl: s.bannerUrl,
    genres: s.genres ? JSON.parse(s.genres) : [],
    seriesStatus: s.seriesStatus,
    latestChapter: s.latestChapter ? s.latestChapter.toString() : null,
    asurascansSlug: s.asurascansSlug,
    mangaplusId: s.mangaplusId,
  };
}
