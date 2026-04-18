import { useState } from 'react'
import { Users, Eye, Video, Heart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useChannelSearch } from '../hooks/useChannel'
import SearchBar from '../components/SearchBar'
import StatCard from '../components/StatCard'
import VideoCard from '../components/VideoCard'
import ChartCard from '../components/ChartCard'
import ErrorMessage from '../components/ErrorMessage'
import { StatCardSkeleton, VideoCardSkeleton, ChannelHeaderSkeleton } from '../components/Skeleton'

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' })
}

const CHART_COLOR = '#3b82f6'

export default function ChannelAnalysis() {
  const [query, setQuery] = useState<string | null>(null)
  const { data, isLoading, error } = useChannelSearch(query)

  const chartData = data?.recentVideos
    .slice()
    .reverse()
    .map((v, i) => ({
      name: `#${i + 1}`,
      views: v.viewCount,
      title: v.title,
    }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold mb-1">Análise de Canal</h1>
        <p className="text-sm text-subtle">Busque um canal pelo nome ou URL do YouTube</p>
      </div>

      <SearchBar placeholder="Ex.: Fireship, @mkbhd, ou cole a URL do canal" onSearch={setQuery} />

      {error && <ErrorMessage message={(error as Error).message} />}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-6">
          <ChannelHeaderSkeleton />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)}
          </div>
        </div>
      )}

      {/* Results */}
      {data && !isLoading && (
        <div className="space-y-6">
          {/* Channel header */}
          <div className="flex items-center gap-4">
            <img
              src={data.channel.thumbnailUrl}
              alt={data.channel.title}
              className="w-16 h-16 rounded-full border border-border"
            />
            <div>
              <h2 className="text-xl font-semibold">{data.channel.title}</h2>
              <p className="text-sm text-subtle">
                {data.channel.customUrl && `${data.channel.customUrl} · `}
                Criado em {formatDate(data.channel.publishedAt)}
                {data.channel.country && ` · ${data.channel.country}`}
              </p>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Inscritos" value={formatCount(data.channel.subscriberCount)} icon={Users} />
            <StatCard label="Total de Visualizações" value={formatCount(data.channel.viewCount)} icon={Eye} />
            <StatCard label="Total de Vídeos" value={formatCount(data.channel.videoCount)} icon={Video} />
            <StatCard
              label="Engajamento Médio"
              value={`${(data.averageEngagement * 100).toFixed(2)}%`}
              icon={Heart}
              accent
            />
          </div>

          {/* Chart */}
          {chartData && chartData.length > 0 && (
            <ChartCard title="Visualizações — últimos 10 vídeos (mais antigo → mais recente)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                  <XAxis dataKey="name" tick={{ fill: '#6b6b6b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tickFormatter={(v) => formatCount(v)}
                    tick={{ fill: '#6b6b6b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 8 }}
                    labelStyle={{ color: '#6b6b6b', fontSize: 11 }}
                    itemStyle={{ color: '#fff', fontSize: 12 }}
                    formatter={(value: number, _name, props) => [
                      formatCount(value),
                      props.payload.title,
                    ]}
                  />
                  <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLOR} fillOpacity={0.7 + i * 0.03} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Recent videos */}
          <div>
            <h3 className="text-sm font-medium text-subtle mb-4">Vídeos Recentes</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.recentVideos.map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!query && !isLoading && (
        <div className="text-center py-20 text-subtle">
          <p className="text-lg">Busque um canal para começar</p>
          <p className="text-sm mt-1">Tente "Fireship", "Theo" ou "@mkbhd"</p>
        </div>
      )}
    </div>
  )
}
