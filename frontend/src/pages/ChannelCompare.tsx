import { useState } from 'react'
import { X, Users, Eye, Video, TrendingUp } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts'
import { useCompare } from '../hooks/useCompare'
import SearchBar from '../components/SearchBar'
import ChartCard from '../components/ChartCard'
import ErrorMessage from '../components/ErrorMessage'
import Skeleton from '../components/Skeleton'

const MAX_CHANNELS = 4

const CHANNEL_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f97316']

function formatCount(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

interface ChannelTagProps {
  id: string
  color: string
  onRemove: (id: string) => void
}

function ChannelTag({ id, color, onRemove }: ChannelTagProps) {
  return (
    <div
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-surface text-sm"
      style={{ borderLeftColor: color, borderLeftWidth: 3 }}
    >
      <span className="font-mono text-xs text-subtle truncate max-w-[140px]">{id}</span>
      <button
        onClick={() => onRemove(id)}
        className="text-subtle hover:text-primary transition ml-1"
        aria-label={`Remove ${id}`}
      >
        <X size={13} />
      </button>
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export default function ChannelCompare() {
  const [channelIds, setChannelIds] = useState<string[]>([])
  const [inputError, setInputError] = useState<string | null>(null)

  const { data, isLoading, error } = useCompare(channelIds)

  function handleAddChannel(query: string) {
    setInputError(null)

    // Accept channel ID, @handle, or full URL — extract the relevant part
    let id = query.trim()

    // youtube.com/channel/UCxxxx
    const channelMatch = id.match(/\/channel\/(UC[\w-]+)/)
    if (channelMatch) id = channelMatch[1]

    // youtube.com/@handle or just @handle
    const handleMatch = id.match(/^@?([\w.-]+)$/)
    if (!channelMatch && handleMatch) id = handleMatch[0].startsWith('@') ? handleMatch[0] : `@${handleMatch[0]}`

    if (channelIds.includes(id)) {
      setInputError('Este canal já está na comparação.')
      return
    }
    if (channelIds.length >= MAX_CHANNELS) {
      setInputError(`Você pode comparar até ${MAX_CHANNELS} canais ao mesmo tempo.`)
      return
    }

    setChannelIds((prev) => [...prev, id])
  }

  function handleRemove(id: string) {
    setChannelIds((prev) => prev.filter((c) => c !== id))
  }

  // Build chart data from metrics
  const subscriberData = data?.metrics.map((m) => ({
    name: m.channelTitle,
    value: m.subscriberCount,
  }))

  const viewData = data?.metrics.map((m) => ({
    name: m.channelTitle,
    value: m.viewCount,
  }))

  const avgViewsData = data?.metrics.map((m) => ({
    name: m.channelTitle,
    value: m.avgViewsPerVideo,
  }))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold mb-1">Comparador de Canais</h1>
        <p className="text-sm text-subtle">Compare até 4 canais lado a lado</p>
      </div>

      {/* Input section */}
      <div className="space-y-3">
        <SearchBar
          placeholder="ID do canal, @handle ou URL do YouTube…"
          onSearch={handleAddChannel}
          buttonLabel="Adicionar"
        />

        {inputError && (
          <p className="text-xs text-accent">{inputError}</p>
        )}

        {channelIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {channelIds.map((id, i) => (
              <ChannelTag
                key={id}
                id={id}
                color={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}

        {channelIds.length === 1 && (
          <p className="text-xs text-subtle">Adicione pelo menos mais um canal — a comparação carrega automaticamente.</p>
        )}
        {channelIds.length >= 2 && (
          <p className="text-xs text-subtle">Comparando {channelIds.length} canais. Adicione ou remova para atualizar.</p>
        )}
      </div>

      {error && <ErrorMessage message={(error as Error).message} />}

      {/* Loading */}
      {isLoading && <TableSkeleton />}

      {/* Results */}
      {data && !isLoading && (
        <div className="space-y-8">
          {/* Comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 pr-6 text-xs text-subtle uppercase tracking-wider font-medium w-40">
                    Metric
                  </th>
                  {data.channels.map((ch, i) => (
                    <th
                      key={ch.id}
                      className="text-left py-3 px-4"
                      style={{ borderBottom: `2px solid ${CHANNEL_COLORS[i % CHANNEL_COLORS.length]}` }}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={ch.thumbnailUrl}
                          alt={ch.title}
                          className="w-7 h-7 rounded-full"
                        />
                        <span className="font-medium truncate max-w-[120px]">{ch.title}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    label: 'Inscritos',
                    icon: Users,
                    key: 'subscriberCount' as const,
                  },
                  {
                    label: 'Total de Visualizações',
                    icon: Eye,
                    key: 'viewCount' as const,
                  },
                  {
                    label: 'Total de Vídeos',
                    icon: Video,
                    key: 'videoCount' as const,
                  },
                  {
                    label: 'Média de Views / Vídeo',
                    icon: TrendingUp,
                    key: 'avgViewsPerVideo' as const,
                  },
                ].map(({ label, icon: Icon, key }) => {
                  const values = data.metrics.map((m) => m[key])
                  const max = Math.max(...values)

                  return (
                    <tr key={key} className="border-b border-border/50 hover:bg-white/[0.02] transition">
                      <td className="py-4 pr-6">
                        <div className="flex items-center gap-2 text-subtle">
                          <Icon size={13} />
                          <span className="text-xs">{label}</span>
                        </div>
                      </td>
                      {data.metrics.map((m, i) => {
                        const val = m[key]
                        const isWinner = val === max
                        return (
                          <td
                            key={m.channelId}
                            className="py-4 px-4 tabular-nums"
                          >
                            <span
                              className={`text-sm font-medium ${
                                isWinner ? 'text-white' : 'text-subtle'
                              }`}
                            >
                              {formatCount(val)}
                            </span>
                            {isWinner && data.channels.length > 1 && (
                              <span
                                className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded font-medium"
                                style={{
                                  background: CHANNEL_COLORS[i % CHANNEL_COLORS.length] + '22',
                                  color: CHANNEL_COLORS[i % CHANNEL_COLORS.length],
                                }}
                              >
                                #1
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard title="Inscritos">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={subscriberData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b6b6b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tickFormatter={(v) => v.length > 8 ? v.slice(0, 8) + '…' : v}
                  />
                  <YAxis
                    tickFormatter={formatCount}
                    tick={{ fill: '#6b6b6b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 8 }}
                    itemStyle={{ color: '#fff', fontSize: 12 }}
                    formatter={(v: number) => [formatCount(v), 'Inscritos']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {subscriberData?.map((_, i) => (
                      <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Total de Visualizações">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={viewData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b6b6b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                    tickFormatter={(v) => v.length > 8 ? v.slice(0, 8) + '…' : v}
                  />
                  <YAxis
                    tickFormatter={formatCount}
                    tick={{ fill: '#6b6b6b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 8 }}
                    itemStyle={{ color: '#fff', fontSize: 12 }}
                    formatter={(v: number) => [formatCount(v), 'Total de Visualizações']}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {viewData?.map((_, i) => (
                      <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Média de Views por Vídeo" className="md:col-span-2">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={avgViewsData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#6b6b6b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />
                  <YAxis
                    tickFormatter={formatCount}
                    tick={{ fill: '#6b6b6b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 8 }}
                    itemStyle={{ color: '#fff', fontSize: 12 }}
                    formatter={(v: number) => [formatCount(v), 'Média de Views/Vídeo']}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, color: '#6b6b6b' }}
                    iconType="circle"
                    iconSize={8}
                  />
                  <Bar dataKey="value" name="Média de Views/Vídeo" radius={[4, 4, 0, 0]}>
                    {avgViewsData?.map((_, i) => (
                      <Cell key={i} fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>
      )}

      {/* Empty state */}
      {channelIds.length === 0 && !isLoading && (
        <div className="text-center py-20 text-subtle space-y-2">
          <div className="flex justify-center gap-3 mb-4">
            {CHANNEL_COLORS.map((color, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                style={{ borderColor: color, color }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <p className="text-lg">Adicione canais para comparar</p>
          <p className="text-sm">Tente "@mkbhd", "@fireship" ou cole a URL de um canal</p>
        </div>
      )}
    </div>
  )
}
