import { useQuery } from '@tanstack/react-query'
import { fetchVideoSearch } from '../services/api'
import type { VideoSearchParams } from '@shared/types'

export function useVideoSearch(params: VideoSearchParams | null) {
  return useQuery({
    queryKey: ['videos', 'search', params],
    queryFn: () => fetchVideoSearch(params!),
    enabled: !!params?.q,
  })
}
