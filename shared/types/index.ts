// ─── Channel ────────────────────────────────────────────────────────────────

export interface ChannelStats {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  subscriberCount: number
  viewCount: number
  videoCount: number
  publishedAt: string
  country?: string
  customUrl?: string
}

export interface VideoItem {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  channelId: string
  channelTitle: string
  publishedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  duration: string
}

export interface ChannelWithVideos {
  channel: ChannelStats
  recentVideos: VideoItem[]
  averageEngagement: number // likes / views (0–1)
}

// ─── Video Search ────────────────────────────────────────────────────────────

export type VideoOrder = 'relevance' | 'date' | 'viewCount' | 'rating'
export type VideoDuration = 'any' | 'short' | 'medium' | 'long'

export interface VideoSearchParams {
  q: string
  order?: VideoOrder
  duration?: VideoDuration
  pageToken?: string
  maxResults?: number
}

export interface VideoSearchResult {
  items: VideoItem[]
  nextPageToken?: string
  prevPageToken?: string
  totalResults: number
}

// ─── Trending ────────────────────────────────────────────────────────────────

export interface TrendingParams {
  regionCode?: string
  categoryId?: string
  maxResults?: number
}

export interface TrendingVideo extends VideoItem {
  rank: number
  categoryName: string
}

export interface TrendingResult {
  items: TrendingVideo[]
  categoryDistribution: CategoryCount[]
}

export interface CategoryCount {
  categoryId: string
  categoryName: string
  count: number
}

// ─── Compare ─────────────────────────────────────────────────────────────────

export interface ChannelCompareResult {
  channels: ChannelStats[]
  metrics: CompareMetric[]
}

export interface CompareMetric {
  channelId: string
  channelTitle: string
  subscriberCount: number
  viewCount: number
  videoCount: number
  avgViewsPerVideo: number
}

// ─── API Response wrapper ────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T
  cached: boolean
  timestamp: string
}

export interface ApiError {
  error: string
  code: string
  statusCode: number
}
