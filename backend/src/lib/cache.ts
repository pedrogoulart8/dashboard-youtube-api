import Redis from 'ioredis'

const TTL_SECONDS = 15 * 60 // 15 minutes

// ─── In-memory fallback ───────────────────────────────────────────────────────

interface MemoryEntry {
  value: string
  expiresAt: number
}

const memoryStore = new Map<string, MemoryEntry>()

const memoryCache = {
  async get(key: string): Promise<string | null> {
    const entry = memoryStore.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) {
      memoryStore.delete(key)
      return null
    }
    return entry.value
  },
  async set(key: string, value: string): Promise<void> {
    memoryStore.set(key, { value, expiresAt: Date.now() + TTL_SECONDS * 1000 })
  },
}

// ─── Redis client ─────────────────────────────────────────────────────────────

let redisClient: Redis | null = null

function getRedisClient(): Redis | null {
  if (redisClient) return redisClient

  const url = process.env.REDIS_URL
  if (!url) return null

  try {
    redisClient = new Redis(url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      connectTimeout: 3000,
      maxRetriesPerRequest: 1,
    })

    redisClient.on('error', (err) => {
      console.warn('[cache] Redis error, falling back to memory cache:', err.message)
      redisClient = null
    })

    return redisClient
  } catch {
    return null
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<{ data: T; cached: true } | null> {
  try {
    const redis = getRedisClient()
    const raw = redis ? await redis.get(key) : await memoryCache.get(key)
    if (!raw) return null
    return { data: JSON.parse(raw) as T, cached: true }
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: unknown): Promise<void> {
  const raw = JSON.stringify(value)
  try {
    const redis = getRedisClient()
    if (redis) {
      await redis.set(key, raw, 'EX', TTL_SECONDS)
    } else {
      await memoryCache.set(key, raw)
    }
  } catch {
    // best-effort — don't let cache failures break the request
  }
}

export function buildCacheKey(...parts: string[]): string {
  return parts.join(':')
}
