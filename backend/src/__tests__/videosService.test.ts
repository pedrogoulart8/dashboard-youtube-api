import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/youtube.js', () => ({
  youtube: {
    search: { list: vi.fn() },
    videos: { list: vi.fn() },
  },
}))

vi.mock('../lib/cache.js', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  buildCacheKey: (...parts: string[]) => parts.join(':'),
}))

import { youtube } from '../lib/youtube.js'
import { searchVideos } from '../services/videosService.js'

const mockSearchItem = { id: { videoId: 'v1' } }
const mockVideoItem = {
  id: 'v1',
  snippet: {
    title: 'TypeScript Tips',
    description: 'Learn TS',
    thumbnails: { medium: { url: 'https://example.com/ts.jpg' } },
    channelId: 'ch1',
    channelTitle: 'Dev Channel',
    publishedAt: '2024-03-01T00:00:00Z',
  },
  statistics: { viewCount: '200000', likeCount: '8000', commentCount: '300' },
  contentDetails: { duration: 'PT15M' },
}

beforeEach(() => vi.clearAllMocks())

describe('searchVideos', () => {
  it('returns mapped video items', async () => {
    vi.mocked(youtube.search.list).mockResolvedValue({
      data: {
        items: [mockSearchItem],
        nextPageToken: 'page2',
        pageInfo: { totalResults: 100 },
      },
    } as any)
    vi.mocked(youtube.videos.list).mockResolvedValue({
      data: { items: [mockVideoItem] },
    } as any)

    const result = await searchVideos({ q: 'typescript' })

    expect(result.items).toHaveLength(1)
    expect(result.items[0].title).toBe('TypeScript Tips')
    expect(result.items[0].viewCount).toBe(200_000)
    expect(result.nextPageToken).toBe('page2')
    expect(result.totalResults).toBe(100)
  })

  it('returns empty items when search yields no results', async () => {
    vi.mocked(youtube.search.list).mockResolvedValue({
      data: { items: [], pageInfo: { totalResults: 0 } },
    } as any)

    const result = await searchVideos({ q: 'xyznotfound123' })

    expect(result.items).toHaveLength(0)
    expect(result.totalResults).toBe(0)
  })
})
