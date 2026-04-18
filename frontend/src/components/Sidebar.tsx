import { NavLink } from 'react-router-dom'
import { Search, TrendingUp, BarChart2, GitCompare, Youtube } from 'lucide-react'

const nav = [
  { to: '/channel', label: 'Análise de Canal', icon: BarChart2 },
  { to: '/search', label: 'Busca de Vídeos', icon: Search },
  { to: '/trending', label: 'Em Alta', icon: TrendingUp },
  { to: '/compare', label: 'Comparar Canais', icon: GitCompare },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <aside
      className={[
        'fixed md:static inset-y-0 left-0 z-30',
        'w-56 flex-shrink-0 flex flex-col bg-surface border-r border-border h-screen',
        'transition-transform duration-200 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <Youtube size={22} className="text-accent" />
        <span className="font-semibold text-sm tracking-tight">YouTube Insights</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-white/10 text-primary font-medium'
                  : 'text-subtle hover:text-primary hover:bg-white/5',
              ].join(' ')
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-xs text-subtle">Desenvolvido com YouTube Data API v3</p>
      </div>
    </aside>
  )
}
