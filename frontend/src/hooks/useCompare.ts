import { useQuery } from '@tanstack/react-query'
import { fetchCompare } from '../services/api'

export function useCompare(ids: string[]) {
  return useQuery({
    queryKey: ['compare', ids],
    queryFn: () => fetchCompare(ids),
    enabled: ids.length >= 2,
  })
}
