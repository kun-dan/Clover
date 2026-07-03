import * as cheerio from "cheerio";
import { Decimal } from "@prisma/client/runtime/library";
import type { MangaProvider } from "./index";

export class AsuraScansProvider implements MangaProvider {
  readonly name = "asurascans";
  readonly hostnames: string[];
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = (baseUrl ?? process.env.ASURASCANS_BASE_URL ?? "https://asurascans.com").replace(/\/$/, "");
    this.hostnames = Array.from(new Set(["asurascans.com", "www.asurascans.com", new URL(this.baseUrl).hostname.toLowerCase()]));
  }

  async fetchLatestChapter(url: string): Promise<Decimal | null> {
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

      // Chapter number and "x hours ago" timestamp live in sibling spans inside the
      // same <a>; scoping the regex to each span individually (instead of the whole
      // anchor's concatenated text) avoids merging them into one bogus number.
      $("a[href*='/chapter/']").each((_, el) => {
        let found: string | null = null;
        $(el)
          .find("span")
          .each((_, span) => {
            const match = chapterRe.exec($(span).text().trim());
            if (match) {
              found = match[1];
              return false;
            }
          });
        if (found) {
          const val = new Decimal(found);
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
