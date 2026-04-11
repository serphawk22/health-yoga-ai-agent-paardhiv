import { logSecurityEvent } from '@/lib/security/audit-log';

type RedisClient = {
  isOpen?: boolean;
  connect: () => Promise<unknown>;
  eval: (
    script: string,
    options: { keys: string[]; arguments: string[] }
  ) => Promise<unknown>;
  on: (event: 'error', listener: (error: unknown) => void) => void;
};

type RedisCreateClient = (options: {
  url: string;
  socket?: { connectTimeout?: number };
}) => RedisClient;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const REDIS_RATE_LIMIT_URL = process.env.RATE_LIMIT_REDIS_URL || process.env.REDIS_URL;
const RATE_LIMIT_KEY_PREFIX = process.env.RATE_LIMIT_KEY_PREFIX || 'health-agent:rl';

function toPositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const REDIS_CONNECT_TIMEOUT_MS = toPositiveInt(
  process.env.RATE_LIMIT_REDIS_CONNECT_TIMEOUT_MS,
  750
);

const REDIS_RETRY_DELAY_MS = toPositiveInt(
  process.env.RATE_LIMIT_REDIS_RETRY_DELAY_MS,
  60_000
);

const globalForRateLimit = globalThis as unknown as {
  __healthAgentRateLimitStore?: Map<string, RateLimitEntry>;
  __healthAgentRateLimitCleanupAt?: number;
  __healthAgentRateLimitRedisCreateClient?: RedisCreateClient;
  __healthAgentRateLimitRedisClient?: RedisClient;
  __healthAgentRateLimitRedisConnectPromise?: Promise<RedisClient | null>;
  __healthAgentRateLimitRedisRetryAt?: number;
  __healthAgentRateLimitRedisWarned?: boolean;
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

function warnRedisFallback(error: unknown) {
  if (globalForRateLimit.__healthAgentRateLimitRedisWarned) {
    return;
  }

  globalForRateLimit.__healthAgentRateLimitRedisWarned = true;
  console.warn(
    '[rate-limit] Redis unavailable, falling back to in-memory limiter.',
    error instanceof Error ? error.message : String(error)
  );
}

function getRedisKey(key: string) {
  return `${RATE_LIMIT_KEY_PREFIX}:${key}`;
}

async function getRedisCreateClient(): Promise<RedisCreateClient | null> {
  if (!REDIS_RATE_LIMIT_URL) {
    return null;
  }

  const existing = globalForRateLimit.__healthAgentRateLimitRedisCreateClient;
  if (existing) {
    return existing;
  }

  try {
    const redisModule = await import('redis');
    const createClient = (redisModule as unknown as { createClient: RedisCreateClient }).createClient;
    globalForRateLimit.__healthAgentRateLimitRedisCreateClient = createClient;
    return createClient;
  } catch (error) {
    warnRedisFallback(error);
    return null;
  }
}

async function getRedisClient(): Promise<RedisClient | null> {
  if (!REDIS_RATE_LIMIT_URL) {
    return null;
  }

  const retryAt = globalForRateLimit.__healthAgentRateLimitRedisRetryAt ?? 0;
  if (Date.now() < retryAt) {
    return null;
  }

  const existingClient = globalForRateLimit.__healthAgentRateLimitRedisClient;
  if (existingClient?.isOpen) {
    return existingClient;
  }

  if (globalForRateLimit.__healthAgentRateLimitRedisConnectPromise) {
    return globalForRateLimit.__healthAgentRateLimitRedisConnectPromise;
  }

  globalForRateLimit.__healthAgentRateLimitRedisConnectPromise = (async () => {
    try {
      const createClient = await getRedisCreateClient();
      if (!createClient) {
        return null;
      }

      const client = createClient({
        url: REDIS_RATE_LIMIT_URL,
        socket: {
          connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
        },
      });

      client.on('error', (error) => {
        warnRedisFallback(error);
      });

      await client.connect();
      globalForRateLimit.__healthAgentRateLimitRedisClient = client;
      globalForRateLimit.__healthAgentRateLimitRedisRetryAt = 0;
      return client;
    } catch (error) {
      globalForRateLimit.__healthAgentRateLimitRedisRetryAt = Date.now() + REDIS_RETRY_DELAY_MS;
      warnRedisFallback(error);
      return null;
    } finally {
      globalForRateLimit.__healthAgentRateLimitRedisConnectPromise = undefined;
    }
  })();

  return globalForRateLimit.__healthAgentRateLimitRedisConnectPromise ?? null;
}

function applyInMemoryRateLimit(options: RateLimitOptions): RateLimitResult {
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

  if (!allowed) {
    logSecurityEvent({
      event: 'rate_limit_exceeded',
      severity: 'warn',
      metadata: {
        key: options.key,
        limit: options.limit,
        remaining,
        resetAt: entry.resetAt,
        backend: 'memory',
      },
    });
  }

  return {
    allowed,
    limit: options.limit,
    remaining,
    resetAt: entry.resetAt,
    retryAfterSeconds,
  };
}

async function applyRedisRateLimit(options: RateLimitOptions): Promise<RateLimitResult | null> {
  const client = await getRedisClient();
  if (!client) {
    return null;
  }

  try {
    const redisKey = getRedisKey(options.key);

    const result = await client.eval(
      [
        'local current = redis.call("INCR", KEYS[1])',
        'if current == 1 then redis.call("PEXPIRE", KEYS[1], ARGV[1]) end',
        'local ttl = redis.call("PTTL", KEYS[1])',
        'return {current, ttl}'
      ].join('\n'),
      {
        keys: [redisKey],
        arguments: [String(options.windowMs)],
      }
    ) as [number | string, number | string];

    const current = Number(result?.[0] ?? 0);
    const ttlMs = Number(result?.[1] ?? options.windowMs);
    const now = Date.now();

    const safeTtlMs = ttlMs > 0 ? ttlMs : options.windowMs;
    const resetAt = now + safeTtlMs;
    const allowed = current <= options.limit;
    const remaining = Math.max(0, options.limit - current);
    const retryAfterSeconds = allowed ? 0 : Math.max(1, Math.ceil(safeTtlMs / 1000));

    if (!allowed) {
      logSecurityEvent({
        event: 'rate_limit_exceeded',
        severity: 'warn',
        metadata: {
          key: options.key,
          limit: options.limit,
          remaining,
          resetAt,
          backend: 'redis',
        },
      });
    }

    return {
      allowed,
      limit: options.limit,
      remaining,
      resetAt,
      retryAfterSeconds,
    };
  } catch (error) {
    warnRedisFallback(error);
    return null;
  }
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

export async function applyRateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  // Fast path for environments without Redis configured.
  if (!REDIS_RATE_LIMIT_URL) {
    return applyInMemoryRateLimit(options);
  }

  const redisResult = await applyRedisRateLimit(options);
  if (redisResult) {
    return redisResult;
  }

  return applyInMemoryRateLimit(options);
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
