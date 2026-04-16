import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  accent?: boolean
}

export default function StatCard({ label, value, icon: Icon, accent }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-subtle uppercase tracking-wider">{label}</span>
        {Icon && (
          <div className={`p-1.5 rounded-md ${accent ? 'bg-accent/10' : 'bg-white/5'}`}>
            <Icon size={14} className={accent ? 'text-accent' : 'text-subtle'} />
          </div>
        )}
      </div>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </div>
  )
}
