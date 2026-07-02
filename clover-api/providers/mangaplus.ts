import { Decimal } from "@prisma/client/runtime/library";
import type { Series } from "@prisma/client";
import type { MangaProvider } from "./index";

interface MangaPlusChapter {
  chapterId: number;
  name: string;
  subTitle: string | null;
}

export class MangaPlusProvider implements MangaProvider {
  readonly name = "mangaplus";
  private apiBase: string;

  constructor(apiBase?: string) {
    this.apiBase = (apiBase ?? process.env.MANGAPLUS_API_URL ?? "https://jumpg-webapi.tokyo-cdn.com").replace(/\/$/, "");
  }

  async fetchLatestChapter(series: Series): Promise<Decimal | null> {
    if (!series.mangaplusId) return null;

    const url = `${this.apiBase}/api/title_detail?title_id=${series.mangaplusId}&lang=eng`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "MangaPlus/1 CFNetwork/1494.0.7 Darwin/23.4.0" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        console.warn(`[MangaPlus] HTTP ${res.status} for title ${series.mangaplusId}`);
        return null;
      }

      const json = await res.json();
      const groups: { firstChapterList?: MangaPlusChapter[]; lastChapterList?: MangaPlusChapter[] }[] =
        json?.success?.titleDetailView?.chapterListGroup ?? [];

      let max: Decimal | null = null;
      const chapterRe = /#([\d]+(?:\.[\d]+)?)/;

      for (const group of groups) {
        const chapters = [...(group.firstChapterList ?? []), ...(group.lastChapterList ?? [])];
        for (const ch of chapters) {
          const match = chapterRe.exec(ch.name);
          if (match) {
            const val = new Decimal(match[1]);
            if (max === null || val.greaterThan(max)) max = val;
          }
        }
      }

      return max;
    } catch (err) {
      console.warn(`[MangaPlus] Failed for title ${series.mangaplusId}:`, (err as Error).message);
      return null;
    }
  }
}
