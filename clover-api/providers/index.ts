import type { Series } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export interface MangaProvider {
  name: string;
  fetchLatestChapter(series: Series): Promise<Decimal | null>;
}

export { AsuraScansProvider } from "./asurascans";
export { MangaPlusProvider } from "./mangaplus";
