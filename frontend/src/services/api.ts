import axios from 'axios'
import type {
  ChannelWithVideos,
  VideoSearchParams,
  VideoSearchResult,
  TrendingParams,
  TrendingResult,
  ChannelCompareResult,
  ApiSuccess,
} from '@shared/types'

const api = axios.create({
  baseURL: '/api',
  timeout: 15_000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ?? err.message ?? 'An unexpected error occurred'
    return Promise.reject(new Error(message))
  },
)

export async function fetchChannelById(id: string): Promise<ChannelWithVideos> {
  const res = await api.get<ApiSuccess<ChannelWithVideos>>(`/channel/${id}`)
  return res.data.data
}

export async function fetchChannelBySearch(q: string): Promise<ChannelWithVideos> {
  const res = await api.get<ApiSuccess<ChannelWithVideos>>('/channel/search', { params: { q } })
  return res.data.data
}

export async function fetchVideoSearch(params: VideoSearchParams): Promise<VideoSearchResult> {
  const res = await api.get<ApiSuccess<VideoSearchResult>>('/videos/search', { params })
  return res.data.data
}

export async function fetchTrending(params: TrendingParams): Promise<TrendingResult> {
  const res = await api.get<ApiSuccess<TrendingResult>>('/trending', { params })
  return res.data.data
}

export async function fetchCompare(ids: string[]): Promise<ChannelCompareResult> {
  const res = await api.get<ApiSuccess<ChannelCompareResult>>('/channels/compare', {
    params: { ids: ids.join(',') },
  })
  return res.data.data
}
