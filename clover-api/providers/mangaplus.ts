import { randomUUID } from "node:crypto";
import * as protobuf from "protobufjs";
import { Decimal } from "@prisma/client/runtime/library";
import type { MangaProvider } from "./index";

// MangaPlus's webapi responds with protobuf, not JSON. Field numbers below are
// taken from the real wire format (verified against a live title_detailV3 response);
// message/field names are ours, only the numbers have to match.
const PROTO_SOURCE = `
  syntax = "proto3";
  message Chapter {
    uint32 chapterId = 2;
    string name = 3;
  }
  message ChaptersView {
    repeated Chapter firstChapterList = 2;
    repeated Chapter lastChapterList = 4;
  }
  message TitleDetailView {
    repeated ChaptersView chapters = 28;
  }
  message SuccessResult {
    oneof result {
      TitleDetailView titleDetail = 8;
    }
  }
  message Response {
    SuccessResult successResult = 1;
  }
`;

const MangaPlusResponse = protobuf.parse(PROTO_SOURCE).root.lookupType("Response");

interface MangaPlusChapter {
  chapterId: number;
  name: string;
}

export class MangaPlusProvider implements MangaProvider {
  readonly name = "mangaplus";
  readonly hostnames = ["mangaplus.shueisha.co.jp"];
  private apiBase: string;

  constructor(apiBase?: string) {
    this.apiBase = (apiBase ?? process.env.MANGAPLUS_API_URL ?? "https://jumpg-webapi.tokyo-cdn.com").replace(/\/$/, "");
  }

  async fetchLatestChapter(sourceUrl: string): Promise<Decimal | null> {
    const idMatch = /\/titles\/(\d+)/.exec(sourceUrl);
    if (!idMatch) return null;
    const titleId = idMatch[1];

    const url = `${this.apiBase}/api/title_detailV3?title_id=${titleId}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Origin: "https://mangaplus.shueisha.co.jp",
          Referer: "https://mangaplus.shueisha.co.jp/",
          "SESSION-TOKEN": randomUUID(),
        },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        console.warn(`[MangaPlus] HTTP ${res.status} for title ${titleId}`);
        return null;
      }

      const bytes = new Uint8Array(await res.arrayBuffer());
      const decoded = MangaPlusResponse.decode(bytes) as unknown as {
        successResult?: { titleDetail?: { chapters?: { firstChapterList?: MangaPlusChapter[]; lastChapterList?: MangaPlusChapter[] }[] } };
      };
      const views = decoded.successResult?.titleDetail?.chapters ?? [];

      let max: Decimal | null = null;
      const chapterRe = /#([\d]+(?:\.[\d]+)?)/;

      for (const view of views) {
        const chapters = [...(view.firstChapterList ?? []), ...(view.lastChapterList ?? [])];
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
      console.warn(`[MangaPlus] Failed for title ${titleId}:`, (err as Error).message);
      return null;
    }
  }
}
