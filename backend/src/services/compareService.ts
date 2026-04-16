import { youtube } from '../lib/youtube.js'
import { cacheGet, cacheSet, buildCacheKey } from '../lib/cache.js'
import type { ChannelCompareResult, ChannelStats, CompareMetric } from '../../../shared/types/index.js'

function parseNumber(value: string | null | undefined): number {
  return parseInt(value ?? '0', 10) || 0
}

async function resolveToChannelId(input: string): Promise<string> {
  const trimmed = input.trim()

  // Already a channel ID (UCxxxxxxx)
  if (/^UC[\w-]{22}$/.test(trimmed)) return trimmed

  // @handle — use forHandle param
  if (trimmed.startsWith('@')) {
    const res = await youtube.channels.list({
      part: ['id'],
      forHandle: trimmed.slice(1),
    })
    const id = res.data.items?.[0]?.id
    if (!id) throw new Error(`Channel not found for handle: ${trimmed}`)
    return id
  }

  // Plain name — search for the best match
  const res = await youtube.search.list({
    part: ['snippet'],
    q: trimmed,
    type: ['channel'],
    maxResults: 1,
  })
  const id = res.data.items?.[0]?.id?.channelId
  if (!id) throw new Error(`No channel found for: "${trimmed}"`)
  return id
}

export async function compareChannels(channelIds: string[]): Promise<ChannelCompareResult> {
  if (channelIds.length < 2 || channelIds.length > 4) {
    throw new Error('Provide between 2 and 4 channel IDs to compare')
  }

  // Resolve names/handles to real channel IDs
  const resolvedIds = await Promise.all(channelIds.map(resolveToChannelId))

  const sortedIds = [...resolvedIds].sort()
  const cacheKey = buildCacheKey('compare', sortedIds.join(','))
  const cached = await cacheGet<ChannelCompareResult>(cacheKey)
  if (cached) return cached.data

  const res = await youtube.channels.list({
    part: ['snippet', 'statistics'],
    id: resolvedIds,
  })

  const channels: ChannelStats[] = []
  const metrics: CompareMetric[] = []

  for (const item of res.data.items ?? []) {
    const snippet = item.snippet ?? {}
    const stats = item.statistics ?? {}

    const subscriberCount = parseNumber(stats.subscriberCount)
    const viewCount = parseNumber(stats.viewCount)
    const videoCount = parseNumber(stats.videoCount)
    const avgViewsPerVideo = videoCount > 0 ? Math.round(viewCount / videoCount) : 0

    const channel: ChannelStats = {
      id: item.id!,
      title: snippet.title ?? '',
      description: snippet.description ?? '',
      thumbnailUrl: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? '',
      subscriberCount,
      viewCount,
      videoCount,
      publishedAt: snippet.publishedAt ?? '',
      country: snippet.country ?? undefined,
      customUrl: snippet.customUrl ?? undefined,
    }

    channels.push(channel)
    metrics.push({
      channelId: item.id!,
      channelTitle: snippet.title ?? '',
      subscriberCount,
      viewCount,
      videoCount,
      avgViewsPerVideo,
    })
  }

  const result: ChannelCompareResult = { channels, metrics }
  await cacheSet(cacheKey, result)
  return result
}
