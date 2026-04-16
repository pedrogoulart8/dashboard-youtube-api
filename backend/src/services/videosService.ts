import { youtube } from '../lib/youtube.js'
import { cacheGet, cacheSet, buildCacheKey } from '../lib/cache.js'
import type { VideoSearchParams, VideoSearchResult, VideoItem } from '../../../shared/types/index.js'

function parseNumber(value: string | null | undefined): number {
  return parseInt(value ?? '0', 10) || 0
}

function mapVideoDuration(duration: string): string {
  return duration ?? ''
}

export async function searchVideos(params: VideoSearchParams): Promise<VideoSearchResult> {
  const { q, order = 'relevance', duration = 'any', pageToken, maxResults = 12 } = params

  const cacheKey = buildCacheKey(
    'videos-search',
    q,
    order,
    duration,
    pageToken ?? 'first',
    String(maxResults),
  )
  const cached = await cacheGet<VideoSearchResult>(cacheKey)
  if (cached) return cached.data

  const searchRes = await youtube.search.list({
    part: ['snippet'],
    q,
    order,
    videoDuration: duration === 'any' ? undefined : duration,
    type: ['video'],
    pageToken: pageToken ?? undefined,
    maxResults,
  })

  const videoIds = (searchRes.data.items ?? [])
    .map((i) => i.id?.videoId)
    .filter(Boolean) as string[]

  let items: VideoItem[] = []

  if (videoIds.length > 0) {
    const videosRes = await youtube.videos.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: videoIds,
    })

    items = (videosRes.data.items ?? []).map((item) => {
      const snippet = item.snippet ?? {}
      const stats = item.statistics ?? {}
      const content = item.contentDetails ?? {}
      return {
        id: item.id!,
        title: snippet.title ?? '',
        description: snippet.description ?? '',
        thumbnailUrl: snippet.thumbnails?.medium?.url ?? snippet.thumbnails?.default?.url ?? '',
        channelId: snippet.channelId ?? '',
        channelTitle: snippet.channelTitle ?? '',
        publishedAt: snippet.publishedAt ?? '',
        viewCount: parseNumber(stats.viewCount),
        likeCount: parseNumber(stats.likeCount),
        commentCount: parseNumber(stats.commentCount),
        duration: mapVideoDuration(content.duration ?? ''),
      }
    })
  }

  const result: VideoSearchResult = {
    items,
    nextPageToken: searchRes.data.nextPageToken ?? undefined,
    prevPageToken: searchRes.data.prevPageToken ?? undefined,
    totalResults: searchRes.data.pageInfo?.totalResults ?? 0,
  }

  await cacheSet(cacheKey, result)
  return result
}
