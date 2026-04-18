import type { ReactNode } from 'react'

interface ChartCardProps {
  title: string
  children: ReactNode
  className?: string
  headerRight?: ReactNode
}

export default function ChartCard({ title, children, className = '', headerRight }: ChartCardProps) {
  return (
    <div className={`bg-surface border border-border rounded-xl p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-subtle">{title}</h3>
        {headerRight}
      </div>
      {children}
    </div>
  )
}
