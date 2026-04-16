import { youtube } from '../lib/youtube.js'
import { cacheGet, cacheSet, buildCacheKey } from '../lib/cache.js'
import type { ChannelStats, VideoItem, ChannelWithVideos } from '../../../shared/types/index.js'

function parseNumber(value: string | null | undefined): number {
  return parseInt(value ?? '0', 10) || 0
}

function mapVideoItem(item: any): VideoItem {
  const snippet = item.snippet ?? {}
  const stats = item.statistics ?? {}
  const content = item.contentDetails ?? {}
  return {
    id: item.id,
    title: snippet.title ?? '',
    description: snippet.description ?? '',
    thumbnailUrl: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? '',
    channelId: snippet.channelId ?? '',
    channelTitle: snippet.channelTitle ?? '',
    publishedAt: snippet.publishedAt ?? '',
    viewCount: parseNumber(stats.viewCount),
    likeCount: parseNumber(stats.likeCount),
    commentCount: parseNumber(stats.commentCount),
    duration: content.duration ?? '',
  }
}

export async function getChannelById(channelId: string): Promise<ChannelWithVideos> {
  const cacheKey = buildCacheKey('channel', channelId)
  const cached = await cacheGet<ChannelWithVideos>(cacheKey)
  if (cached) return cached.data

  // Fetch channel data
  const channelRes = await youtube.channels.list({
    part: ['snippet', 'statistics', 'brandingSettings'],
    id: [channelId],
  })

  const channelItem = channelRes.data.items?.[0]
  if (!channelItem) throw new Error(`Channel not found: ${channelId}`)

  const snippet = channelItem.snippet ?? {}
  const stats = channelItem.statistics ?? {}

  const channel: ChannelStats = {
    id: channelItem.id!,
    title: snippet.title ?? '',
    description: snippet.description ?? '',
    thumbnailUrl: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? '',
    subscriberCount: parseNumber(stats.subscriberCount),
    viewCount: parseNumber(stats.viewCount),
    videoCount: parseNumber(stats.videoCount),
    publishedAt: snippet.publishedAt ?? '',
    country: snippet.country ?? undefined,
    customUrl: snippet.customUrl ?? undefined,
  }

  // Fetch recent videos via search
  const searchRes = await youtube.search.list({
    part: ['snippet'],
    channelId,
    order: 'date',
    type: ['video'],
    maxResults: 10,
  })

  const videoIds = (searchRes.data.items ?? [])
    .map((i) => i.id?.videoId)
    .filter(Boolean) as string[]

  let recentVideos: VideoItem[] = []

  if (videoIds.length > 0) {
    const videosRes = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds,
    })
    recentVideos = (videosRes.data.items ?? []).map(mapVideoItem)
  }

  const avgEngagement =
    recentVideos.length > 0
      ? recentVideos.reduce((acc, v) => acc + (v.viewCount > 0 ? v.likeCount / v.viewCount : 0), 0) /
        recentVideos.length
      : 0

  const result: ChannelWithVideos = { channel, recentVideos, averageEngagement: avgEngagement }
  await cacheSet(cacheKey, result)
  return result
}

export async function searchChannel(query: string): Promise<ChannelWithVideos> {
  const cacheKey = buildCacheKey('channel-search', query.toLowerCase().trim())
  const cached = await cacheGet<ChannelWithVideos>(cacheKey)
  if (cached) return cached.data

  const searchRes = await youtube.search.list({
    part: ['snippet'],
    q: query,
    type: ['channel'],
    maxResults: 1,
  })

  const channelId = searchRes.data.items?.[0]?.id?.channelId
  if (!channelId) throw new Error(`No channel found for query: "${query}"`)

  const result = await getChannelById(channelId)
  await cacheSet(cacheKey, result)
  return result
}
