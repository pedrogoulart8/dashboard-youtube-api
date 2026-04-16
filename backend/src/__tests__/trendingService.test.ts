import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/youtube.js', () => ({
  youtube: { videos: { list: vi.fn() } },
}))

vi.mock('../lib/cache.js', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  buildCacheKey: (...parts: string[]) => parts.join(':'),
}))

import { youtube } from '../lib/youtube.js'
import { getTrending } from '../services/trendingService.js'

const makeMockVideo = (id: string, categoryId: string) => ({
  id,
  snippet: {
    title: `Trending ${id}`,
    description: '',
    thumbnails: { medium: { url: `https://example.com/${id}.jpg` } },
    channelId: 'ch1',
    channelTitle: 'Channel',
    publishedAt: '2024-06-01T00:00:00Z',
    categoryId,
  },
  statistics: { viewCount: '500000', likeCount: '20000', commentCount: '1000' },
  contentDetails: { duration: 'PT8M' },
})

beforeEach(() => vi.clearAllMocks())

describe('getTrending', () => {
  it('maps videos with rank and category name', async () => {
    vi.mocked(youtube.videos.list).mockResolvedValue({
      data: { items: [makeMockVideo('v1', '10'), makeMockVideo('v2', '10'), makeMockVideo('v3', '20')] },
    } as any)

    const result = await getTrending({ regionCode: 'BR' })

    expect(result.items[0].rank).toBe(1)
    expect(result.items[1].rank).toBe(2)
    expect(result.items[0].categoryName).toBe('Music')
    expect(result.items[2].categoryName).toBe('Gaming')
  })

  it('builds category distribution correctly', async () => {
    vi.mocked(youtube.videos.list).mockResolvedValue({
      data: { items: [makeMockVideo('v1', '10'), makeMockVideo('v2', '10'), makeMockVideo('v3', '22')] },
    } as any)

    const result = await getTrending({})

    const music = result.categoryDistribution.find((c) => c.categoryId === '10')
    expect(music?.count).toBe(2)
    const entertainment = result.categoryDistribution.find((c) => c.categoryId === '22')
    expect(entertainment?.count).toBe(1)
  })
})
