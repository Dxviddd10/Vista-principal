import { ChevronDown, Search } from 'lucide-react'
import { NotificationsPanel } from './overview/NotificationsPanel'
import type { ActivityEvent } from '@/lib/types'

export function Header({
  search,
  onSearchChange,
  events,
  onSelectSolicitud,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  search: string
  onSearchChange: (value: string) => void
  events: ActivityEvent[]
  onSelectSolicitud: (id: string) => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-white/[0.07] px-5 sm:px-8">
      <div className="flex items-center gap-3">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          <input
            aria-label="Buscar"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Buscar código, repositorio, rama..."
            className="w-72 rounded-lg border border-white/[0.08] bg-white/[0.03] py-2 pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-400/50"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <NotificationsPanel
          events={events}
          onSelectSolicitud={onSelectSolicitud}
          onMarkAsRead={onMarkAsRead}
          onMarkAllAsRead={onMarkAllAsRead}
        />
        <div className="h-5 w-px bg-white/10" />
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-400 text-[10px] font-bold text-indigo-950">
            MR
          </div>
          <span className="hidden text-xs font-medium text-slate-300 sm:block">María Rodríguez</span>
          <ChevronDown size={14} className="text-slate-500" />
        </div>
      </div>
    </header>
  )
}
