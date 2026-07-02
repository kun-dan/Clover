import * as cheerio from "cheerio";
import { Decimal } from "@prisma/client/runtime/library";
import type { Series } from "@prisma/client";
import type { MangaProvider } from "./index";

export class AsuraScansProvider implements MangaProvider {
  readonly name = "asurascans";
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl ?? process.env.ASURASCANS_BASE_URL ?? "https://asurascans.com").replace(/\/$/, "");
  }

  async fetchLatestChapter(series: Series): Promise<Decimal | null> {
    if (!series.asurascansSlug) return null;

    const url = `${this.baseUrl}/manga/${series.asurascansSlug}/`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Referer": this.baseUrl,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(15_000),
      });

      if (!res.ok) {
        console.warn(`[AsuraScans] HTTP ${res.status} for ${url}`);
        return null;
      }

      const html = await res.text();
      const $ = cheerio.load(html);

      let max: Decimal | null = null;
      const chapterRe = /(?:chapter|ch\.?)\s*([\d]+(?:\.[\d]+)?)/i;

      $("a[href]").each((_, el) => {
        const text = $(el).text().trim();
        const match = chapterRe.exec(text);
        if (match) {
          const val = new Decimal(match[1]);
          if (max === null || val.greaterThan(max)) max = val;
        }
      });

      return max;
    } catch (err) {
      console.warn(`[AsuraScans] Failed to fetch ${url}:`, (err as Error).message);
      return null;
    }
  }
}
