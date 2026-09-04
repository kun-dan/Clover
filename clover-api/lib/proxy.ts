/**
 * Node's global fetch (undici) ignores HTTP_PROXY/HTTPS_PROXY, unlike curl and most HTTP clients.
 * On networks with no direct egress — a campus or corporate proxy — every outbound
 * call in this app fails: AniList metadata, the AsuraScans and MangaPlus providers,
 * and the hourly chapter update job.
 *
 * Installing an EnvHttpProxyAgent as the global dispatcher makes fetch honor the
 * standard proxy env vars. No proxy configured means no dispatcher and no change.
 *
 * Credentials live in HTTP_PROXY/HTTPS_PROXY, never in this file.
 */
export async function configureFetchProxy(): Promise<void> {
  const proxy =
    process.env.HTTPS_PROXY ||
    process.env.https_proxy ||
    process.env.HTTP_PROXY ||
    process.env.http_proxy;

  if (!proxy) return;

  // EnvHttpProxyAgent reads NO_PROXY when constructed. Without a bypass, requests
  // to our own host would be tunnelled out to the proxy and rejected.
  if (!process.env.NO_PROXY && !process.env.no_proxy) {
    process.env.NO_PROXY = "localhost,127.0.0.1,::1";
  }

  const { EnvHttpProxyAgent, setGlobalDispatcher } = await import("undici");
  setGlobalDispatcher(new EnvHttpProxyAgent());

  console.log(
    `[Proxy] Outbound fetch routed via ${proxy.replace(/\/\/[^@]*@/, "//")}` +
      ` (bypass: ${process.env.NO_PROXY || process.env.no_proxy})`,
  );
}
