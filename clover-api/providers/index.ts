import { Decimal } from "@prisma/client/runtime/library";

export interface MangaProvider {
  name: string;
  hostnames: string[];
  fetchLatestChapter(url: string): Promise<Decimal | null>;
}

export { AsuraScansProvider } from "./asurascans";
export { MangaPlusProvider } from "./mangaplus";

import { AsuraScansProvider } from "./asurascans";
import { MangaPlusProvider } from "./mangaplus";

const registry: Record<string, MangaProvider> = {
  asurascans: new AsuraScansProvider(),
  mangaplus: new MangaPlusProvider(),
};

export function getProviders(): MangaProvider[] {
  return Object.values(registry);
}

export function getProviderNames(): string[] {
  return Object.keys(registry);
}

// Single gate all callers must go through before fetching a stored ReadingSource.url:
// ReadingSource.url is free-text user input, so without checking it against the
// provider's own known hostnames, a user could point a "asurascans" bookmark at an
// arbitrary/internal URL and have the server fetch it on every page load (SSRF).
export function resolveProvider(providerName: string | null | undefined, url: string): MangaProvider | null {
  if (!providerName) return null;
  const provider = registry[providerName.toLowerCase()];
  if (!provider) return null;

  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }

  return provider.hostnames.includes(hostname) ? provider : null;
}
