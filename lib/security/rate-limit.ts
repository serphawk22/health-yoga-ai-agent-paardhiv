type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as unknown as {
  __healthAgentRateLimitStore?: Map<string, RateLimitEntry>;
  __healthAgentRateLimitCleanupAt?: number;
};

const store = globalForRateLimit.__healthAgentRateLimitStore ?? new Map<string, RateLimitEntry>();
if (!globalForRateLimit.__healthAgentRateLimitStore) {
  globalForRateLimit.__healthAgentRateLimitStore = store;
}

function cleanupExpired(now: number) {
  const nextCleanupAt = globalForRateLimit.__healthAgentRateLimitCleanupAt ?? 0;
  if (now < nextCleanupAt) {
    return;
  }

  for (const [key, value] of store.entries()) {
    if (value.resetAt <= now) {
      store.delete(key);
    }
  }

  globalForRateLimit.__healthAgentRateLimitCleanupAt = now + 60_000;
}

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds: number;
}

export function applyRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const existing = store.get(options.key);

  let entry: RateLimitEntry;
  if (!existing || existing.resetAt <= now) {
    entry = {
      count: 1,
      resetAt: now + options.windowMs,
    };
  } else {
    entry = {
      count: existing.count + 1,
      resetAt: existing.resetAt,
    };
  }

  store.set(options.key, entry);

  const allowed = entry.count <= options.limit;
  const remaining = Math.max(0, options.limit - entry.count);
  const retryAfterSeconds = allowed ? 0 : Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

  return {
    allowed,
    limit: options.limit,
    remaining,
    resetAt: entry.resetAt,
    retryAfterSeconds,
  };
}

interface HeadersLike {
  get(name: string): string | null;
}

export function getClientIdentifierFromHeaders(headers: HeadersLike): string {
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }

  const xRealIp = headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp.trim();
  }

  const xForwardedFor = headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  return 'unknown';
}

export function getClientIdentifier(request: { headers: HeadersLike }): string {
  return getClientIdentifierFromHeaders(request.headers);
}
