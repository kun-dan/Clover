// In-memory OAuth state cache with TTL. Fine for single-instance MVP.
const cache = new Map<string, { expiry: number }>();

const TTL_MS = 10 * 60 * 1000; // 10 minutes

export function setState(state: string) {
  cache.set(state, { expiry: Date.now() + TTL_MS });
}

export function consumeState(state: string): boolean {
  const entry = cache.get(state);
  if (!entry || Date.now() > entry.expiry) {
    cache.delete(state);
    return false;
  }
  cache.delete(state);
  return true;
}

// Prune expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of cache.entries()) {
    if (now > val.expiry) cache.delete(key);
  }
}, TTL_MS);
