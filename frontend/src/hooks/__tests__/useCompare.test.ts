import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useCompare } from '../useCompare'
import * as api from '../../services/api'
import type { ChannelCompareResult } from '@shared/types'

vi.mock('../../services/api')

const mockCompareResult: ChannelCompareResult = {
  channels: [
    {
      id: 'ch1',
      title: 'Channel A',
      description: '',
      thumbnailUrl: 'https://example.com/a.jpg',
      subscriberCount: 2_000_000,
      viewCount: 100_000_000,
      videoCount: 300,
      publishedAt: '2015-01-01T00:00:00Z',
    },
    {
      id: 'ch2',
      title: 'Channel B',
      description: '',
      thumbnailUrl: 'https://example.com/b.jpg',
      subscriberCount: 800_000,
      viewCount: 40_000_000,
      videoCount: 150,
      publishedAt: '2018-06-01T00:00:00Z',
    },
  ],
  metrics: [
    {
      channelId: 'ch1',
      channelTitle: 'Channel A',
      subscriberCount: 2_000_000,
      viewCount: 100_000_000,
      videoCount: 300,
      avgViewsPerVideo: 333_333,
    },
    {
      channelId: 'ch2',
      channelTitle: 'Channel B',
      subscriberCount: 800_000,
      viewCount: 40_000_000,
      videoCount: 150,
      avgViewsPerVideo: 266_666,
    },
  ],
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useCompare', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when fewer than 2 ids are provided', () => {
    const { result } = renderHook(() => useCompare(['ch1']), {
      wrapper: makeWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('is disabled when ids array is empty', () => {
    const { result } = renderHook(() => useCompare([]), {
      wrapper: makeWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('fetches comparison data when 2+ ids are provided', async () => {
    vi.mocked(api.fetchCompare).mockResolvedValue(mockCompareResult)

    const { result } = renderHook(() => useCompare(['ch1', 'ch2']), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.fetchCompare).toHaveBeenCalledWith(['ch1', 'ch2'])
    expect(result.current.data?.channels).toHaveLength(2)
    expect(result.current.data?.metrics[0].channelTitle).toBe('Channel A')
  })

  it('exposes error on failure', async () => {
    vi.mocked(api.fetchCompare).mockRejectedValue(new Error('Too many channels'))

    const { result } = renderHook(() => useCompare(['ch1', 'ch2', 'ch3', 'ch4', 'ch5']), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as Error).message).toBe('Too many channels')
  })
})
