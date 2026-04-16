import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useVideoSearch } from '../hooks/useVideoSearch'
import SearchBar from '../components/SearchBar'
import VideoCard from '../components/VideoCard'
import ErrorMessage from '../components/ErrorMessage'
import { VideoCardSkeleton } from '../components/Skeleton'
import type { VideoOrder, VideoDuration } from '@shared/types'

const ORDERS: { value: VideoOrder; label: string }[] = [
  { value: 'relevance', label: 'Relevância' },
  { value: 'date', label: 'Data' },
  { value: 'viewCount', label: 'Visualizações' },
  { value: 'rating', label: 'Avaliação' },
]

const DURATIONS: { value: VideoDuration; label: string }[] = [
  { value: 'any', label: 'Qualquer' },
  { value: 'short', label: 'Curto (<4 min)' },
  { value: 'medium', label: 'Médio (4–20 min)' },
  { value: 'long', label: 'Longo (>20 min)' },
]

export default function VideoSearch() {
  const [query, setQuery] = useState('')
  const [order, setOrder] = useState<VideoOrder>('relevance')
  const [duration, setDuration] = useState<VideoDuration>('any')
  const [pageToken, setPageToken] = useState<string | undefined>()
  const [pageHistory, setPageHistory] = useState<string[]>([])

  const params = query ? { q: query, order, duration, pageToken } : null
  const { data, isLoading, error } = useVideoSearch(params)

  function handleSearch(q: string) {
    setQuery(q)
    setPageToken(undefined)
    setPageHistory([])
  }

  function handleNext() {
    if (data?.nextPageToken) {
      setPageHistory((prev) => [...prev, pageToken ?? ''])
      setPageToken(data.nextPageToken)
    }
  }

  function handlePrev() {
    const prev = pageHistory[pageHistory.length - 1]
    setPageHistory((h) => h.slice(0, -1))
    setPageToken(prev || undefined)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Busca de Vídeos</h1>
        <p className="text-sm text-subtle">Busque vídeos do YouTube com filtros</p>
      </div>

      <div className="space-y-3">
        <SearchBar placeholder="Buscar vídeos…" onSearch={handleSearch} />

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-subtle">Ordenar por</span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {ORDERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setOrder(value); setPageToken(undefined); setPageHistory([]) }}
                  className={`px-3 py-1.5 text-xs transition ${
                    order === value
                      ? 'bg-white text-black font-medium'
                      : 'text-subtle hover:text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-subtle">Duração</span>
            <div className="flex rounded-lg border border-border overflow-hidden">
              {DURATIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setDuration(value); setPageToken(undefined); setPageHistory([]) }}
                  className={`px-3 py-1.5 text-xs transition ${
                    duration === value
                      ? 'bg-white text-black font-medium'
                      : 'text-subtle hover:text-primary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={(error as Error).message} />}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-4">
          <p className="text-xs text-subtle">
            Cerca de {data.totalResults.toLocaleString('pt-BR')} resultados
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.items.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              disabled={pageHistory.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-30 hover:border-white/30 transition"
            >
              <ChevronLeft size={14} /> Anterior
            </button>
            <button
              onClick={handleNext}
              disabled={!data.nextPageToken}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-border rounded-lg disabled:opacity-30 hover:border-white/30 transition"
            >
              Próximo <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {!query && !isLoading && (
        <div className="text-center py-20 text-subtle">
          <p className="text-lg">Busque qualquer assunto</p>
          <p className="text-sm mt-1">Tente "tutorial react", "lo-fi música" ou "receita de macarrão"</p>
        </div>
      )}
    </div>
  )
}
