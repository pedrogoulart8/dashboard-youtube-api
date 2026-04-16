import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the youtube lib and cache before importing the service
vi.mock('../lib/youtube.js', () => ({
  youtube: {
    channels: {
      list: vi.fn(),
    },
    search: {
      list: vi.fn(),
    },
    videos: {
      list: vi.fn(),
    },
  },
}))

vi.mock('../lib/cache.js', () => ({
  cacheGet: vi.fn().mockResolvedValue(null),
  cacheSet: vi.fn().mockResolvedValue(undefined),
  buildCacheKey: (...parts: string[]) => parts.join(':'),
}))

import { youtube } from '../lib/youtube.js'
import { getChannelById } from '../services/channelService.js'

const mockChannelItem = {
  id: 'UC_test123',
  snippet: {
    title: 'Test Channel',
    description: 'A test channel',
    thumbnails: { medium: { url: 'https://example.com/thumb.jpg' } },
    publishedAt: '2020-01-01T00:00:00Z',
    country: 'BR',
    customUrl: '@testchannel',
  },
  statistics: {
    subscriberCount: '1000000',
    viewCount: '50000000',
    videoCount: '200',
  },
}

const mockVideoSearchItem = {
  id: { videoId: 'vid_001' },
  snippet: { title: 'Video 1' },
}

const mockVideoItem = {
  id: 'vid_001',
  snippet: {
    title: 'Video 1',
    description: 'Desc',
    thumbnails: { medium: { url: 'https://example.com/vid.jpg' } },
    channelId: 'UC_test123',
    channelTitle: 'Test Channel',
    publishedAt: '2024-01-15T00:00:00Z',
  },
  statistics: { viewCount: '100000', likeCount: '5000', commentCount: '200' },
  contentDetails: { duration: 'PT10M30S' },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getChannelById', () => {
  it('returns channel with recent videos', async () => {
    vi.mocked(youtube.channels.list).mockResolvedValue({
      data: { items: [mockChannelItem] },
    } as any)
    vi.mocked(youtube.search.list).mockResolvedValue({
      data: { items: [mockVideoSearchItem] },
    } as any)
    vi.mocked(youtube.videos.list).mockResolvedValue({
      data: { items: [mockVideoItem] },
    } as any)

    const result = await getChannelById('UC_test123')

    expect(result.channel.id).toBe('UC_test123')
    expect(result.channel.title).toBe('Test Channel')
    expect(result.channel.subscriberCount).toBe(1_000_000)
    expect(result.recentVideos).toHaveLength(1)
    expect(result.recentVideos[0].id).toBe('vid_001')
    expect(result.averageEngagement).toBeCloseTo(0.05)
  })

  it('throws when channel is not found', async () => {
    vi.mocked(youtube.channels.list).mockResolvedValue({
      data: { items: [] },
    } as any)

    await expect(getChannelById('nonexistent')).rejects.toThrow('Channel not found')
  })

  it('handles channels with no videos gracefully', async () => {
    vi.mocked(youtube.channels.list).mockResolvedValue({
      data: { items: [mockChannelItem] },
    } as any)
    vi.mocked(youtube.search.list).mockResolvedValue({
      data: { items: [] },
    } as any)

    const result = await getChannelById('UC_test123')

    expect(result.recentVideos).toHaveLength(0)
    expect(result.averageEngagement).toBe(0)
  })
})
