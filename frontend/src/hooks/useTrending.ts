import { useQuery } from '@tanstack/react-query'
import { fetchTrending } from '../services/api'
import type { TrendingParams } from '@shared/types'

export function useTrending(params: TrendingParams) {
  return useQuery({
    queryKey: ['trending', params],
    queryFn: () => fetchTrending(params),
  })
}
