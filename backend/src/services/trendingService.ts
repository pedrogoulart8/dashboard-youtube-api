import { youtube } from '../lib/youtube.js'
import { cacheGet, cacheSet, buildCacheKey } from '../lib/cache.js'
import type { TrendingParams, TrendingResult, TrendingVideo, CategoryCount } from '../../../shared/types/index.js'

function parseNumber(value: string | null | undefined): number {
  return parseInt(value ?? '0', 10) || 0
}

// Static map for the most common YouTube video categories
const CATEGORY_NAMES: Record<string, string> = {
  '1': 'Film & Animation',
  '2': 'Autos & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '18': 'Short Movies',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '21': 'Videoblogging',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Technology',
  '29': 'Nonprofits & Activism',
}

export async function getTrending(params: TrendingParams): Promise<TrendingResult> {
  const { regionCode = 'BR', categoryId, maxResults = 20 } = params

  const cacheKey = buildCacheKey('trending', regionCode, categoryId ?? 'all', String(maxResults))
  const cached = await cacheGet<TrendingResult>(cacheKey)
  if (cached) return cached.data

  const res = await youtube.videos.list({
    part: ['snippet', 'statistics', 'contentDetails'],
    chart: 'mostPopular',
    regionCode,
    videoCategoryId: categoryId ?? undefined,
    maxResults,
  })

  const categoryCountMap = new Map<string, number>()

  const items: TrendingVideo[] = (res.data.items ?? []).map((item, index) => {
    const snippet = item.snippet ?? {}
    const stats = item.statistics ?? {}
    const content = item.contentDetails ?? {}
    const catId = snippet.categoryId ?? '0'
    const catName = CATEGORY_NAMES[catId] ?? 'Other'

    categoryCountMap.set(catId, (categoryCountMap.get(catId) ?? 0) + 1)

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
      duration: content.duration ?? '',
      rank: index + 1,
      categoryName: catName,
    }
  })

  const categoryDistribution: CategoryCount[] = Array.from(categoryCountMap.entries())
    .map(([catId, count]) => ({
      categoryId: catId,
      categoryName: CATEGORY_NAMES[catId] ?? 'Other',
      count,
    }))
    .sort((a, b) => b.count - a.count)

  const result: TrendingResult = { items, categoryDistribution }
  await cacheSet(cacheKey, result)
  return result
}
