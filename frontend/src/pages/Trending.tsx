import { useState } from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useTrending } from '../hooks/useTrending'
import VideoCard from '../components/VideoCard'
import ChartCard from '../components/ChartCard'
import ErrorMessage from '../components/ErrorMessage'
import { VideoCardSkeleton } from '../components/Skeleton'

const REGIONS = [
  { code: 'BR', label: 'Brasil' },
  { code: 'US', label: 'Estados Unidos' },
  { code: 'GB', label: 'Reino Unido' },
  { code: 'JP', label: 'Japão' },
  { code: 'IN', label: 'Índia' },
  { code: 'DE', label: 'Alemanha' },
  { code: 'KR', label: 'Coreia do Sul' },
  { code: 'MX', label: 'México' },
]

const PIE_COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981',
  '#06b6d4', '#f59e0b', '#6366f1', '#84cc16', '#ef4444',
]

export default function Trending() {
  const [regionCode, setRegionCode] = useState('BR')
  const { data, isLoading, error } = useTrending({ regionCode, maxResults: 20 })

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Em Alta</h1>
          <p className="text-sm text-subtle">Vídeos mais populares agora</p>
        </div>

        {/* Region selector */}
        <div className="flex flex-wrap gap-2">
          {REGIONS.map(({ code, label }) => (
            <button
              key={code}
              onClick={() => setRegionCode(code)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition ${
                regionCode === code
                  ? 'border-white/40 bg-white/10 text-primary font-medium'
                  : 'border-border text-subtle hover:text-primary hover:border-white/20'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorMessage message={(error as Error).message} />}

      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => <VideoCardSkeleton key={i} />)}
        </div>
      )}

      {data && !isLoading && (
        <div className="space-y-8">
          {/* Category distribution chart */}
          {data.categoryDistribution.length > 0 && (
            <ChartCard title="Distribuição por Categoria">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    dataKey="count"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    paddingAngle={3}
                  >
                    {data.categoryDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111', border: '1px solid #1f1f1f', borderRadius: 8 }}
                    itemStyle={{ color: '#fff', fontSize: 12 }}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, color: '#6b6b6b' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          {/* Trending grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.items.map((video) => (
              <VideoCard key={video.id} video={video} rank={video.rank} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
