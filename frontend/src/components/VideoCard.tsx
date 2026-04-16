import type { VideoItem } from '@shared/types'
import { Eye, ThumbsUp, Calendar } from 'lucide-react'

interface VideoCardProps {
  video: VideoItem
  rank?: number
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function VideoCard({ video, rank }: VideoCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden hover:border-white/20 transition group">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        {rank != null && (
          <div className="absolute top-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-0.5 rounded">
            #{rank}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className="text-sm font-medium leading-snug line-clamp-2" title={video.title}>
          {video.title}
        </h3>
        <p className="text-xs text-subtle truncate">{video.channelTitle}</p>

        <div className="flex items-center gap-3 text-xs text-subtle mt-1">
          <span className="flex items-center gap-1">
            <Eye size={12} />
            {formatCount(video.viewCount)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp size={12} />
            {formatCount(video.likeCount)}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Calendar size={12} />
            {formatDate(video.publishedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
