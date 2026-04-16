import { useQuery } from '@tanstack/react-query'
import { fetchChannelById, fetchChannelBySearch } from '../services/api'

export function useChannelById(id: string | null) {
  return useQuery({
    queryKey: ['channel', 'id', id],
    queryFn: () => fetchChannelById(id!),
    enabled: !!id,
  })
}

export function useChannelSearch(query: string | null) {
  return useQuery({
    queryKey: ['channel', 'search', query],
    queryFn: () => fetchChannelBySearch(query!),
    enabled: !!query,
  })
}
