import { prisma } from "./db";
import { type AniListMedia, mediaTitle } from "./anilist";
import type { Series } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export function seriesFromAniList(media: AniListMedia): Omit<Series, "id" | "createdAt" | "updatedAt" | "latestChapter"> {
  return {
    anilistId: media.id,
    title: mediaTitle(media),
    titleRomaji: media.title.romaji,
    description: media.description,
    coverUrl: media.coverImage.extraLarge ?? media.coverImage.large,
    bannerUrl: media.bannerImage,
    genres: JSON.stringify(media.genres ?? []),
    seriesStatus: media.status,
    rating: media.averageScore != null ? new Decimal(media.averageScore / 10) : null,
    isAdult: media.isAdult ?? false,
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
      rating: data.rating,
      isAdult: data.isAdult,
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
    rating: s.rating ? s.rating.toString() : null,
    isAdult: s.isAdult,
  };
}
