import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../lib/youtube.js', () => ({
  youtube: { channels: { list: vi.fn() } },
}))

vi.mock('../lib/cache.js', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  buildCacheKey: (...parts: string[]) => parts.join(':'),
}))

import { youtube } from '../lib/youtube.js'
import { compareChannels } from '../services/compareService.js'

const makeChannel = (id: string, subs: string, views: string, videos: string) => ({
  id,
  snippet: {
    title: `Channel ${id}`,
    description: '',
    thumbnails: { medium: { url: `https://example.com/${id}.jpg` } },
    publishedAt: '2018-01-01T00:00:00Z',
  },
  statistics: { subscriberCount: subs, viewCount: views, videoCount: videos },
})

beforeEach(() => vi.clearAllMocks())

describe('compareChannels', () => {
  it('returns metrics for two channels', async () => {
    vi.mocked(youtube.channels.list).mockResolvedValue({
      data: {
        items: [makeChannel('ch1', '5000000', '200000000', '500'), makeChannel('ch2', '1000000', '40000000', '200')],
      },
    } as any)

    const result = await compareChannels(['ch1', 'ch2'])

    expect(result.channels).toHaveLength(2)
    expect(result.metrics[0].subscriberCount).toBe(5_000_000)
    expect(result.metrics[0].avgViewsPerVideo).toBe(400_000)
    expect(result.metrics[1].avgViewsPerVideo).toBe(200_000)
  })

  it('throws when fewer than 2 IDs are provided', async () => {
    await expect(compareChannels(['ch1'])).rejects.toThrow('between 2 and 4')
  })

  it('throws when more than 4 IDs are provided', async () => {
    await expect(compareChannels(['a', 'b', 'c', 'd', 'e'])).rejects.toThrow('between 2 and 4')
  })
})
