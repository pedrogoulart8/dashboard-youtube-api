import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createElement } from 'react'
import { useChannelById, useChannelSearch } from '../useChannel'
import * as api from '../../services/api'
import type { ChannelWithVideos } from '@shared/types'

vi.mock('../../services/api')

const mockChannelData: ChannelWithVideos = {
  channel: {
    id: 'UC_x5XG1OV2P6uZZ5FSM9Ttw',
    title: 'Google Developers',
    description: 'Official Google Developers channel',
    thumbnailUrl: 'https://example.com/thumb.jpg',
    subscriberCount: 1_000_000,
    viewCount: 500_000_000,
    videoCount: 5000,
    publishedAt: '2007-09-06T00:00:00Z',
    country: 'US',
  },
  recentVideos: [],
  averageEngagement: 0.042,
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useChannelById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when id is null', () => {
    const { result } = renderHook(() => useChannelById(null), {
      wrapper: makeWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
    expect(result.current.data).toBeUndefined()
  })

  it('fetches channel data when id is provided', async () => {
    vi.mocked(api.fetchChannelById).mockResolvedValue(mockChannelData)

    const { result } = renderHook(() => useChannelById('UC_x5XG1OV2P6uZZ5FSM9Ttw'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.fetchChannelById).toHaveBeenCalledWith('UC_x5XG1OV2P6uZZ5FSM9Ttw')
    expect(result.current.data).toEqual(mockChannelData)
  })

  it('exposes error when fetch fails', async () => {
    vi.mocked(api.fetchChannelById).mockRejectedValue(new Error('Channel not found'))

    const { result } = renderHook(() => useChannelById('bad-id'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect((result.current.error as Error).message).toBe('Channel not found')
  })
})

describe('useChannelSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('is disabled when query is null', () => {
    const { result } = renderHook(() => useChannelSearch(null), {
      wrapper: makeWrapper(),
    })
    expect(result.current.fetchStatus).toBe('idle')
  })

  it('fetches channel by search query', async () => {
    vi.mocked(api.fetchChannelBySearch).mockResolvedValue(mockChannelData)

    const { result } = renderHook(() => useChannelSearch('Google Developers'), {
      wrapper: makeWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(api.fetchChannelBySearch).toHaveBeenCalledWith('Google Developers')
    expect(result.current.data?.channel.title).toBe('Google Developers')
  })
})
