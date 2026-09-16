'use client'

import { useMemo, useState } from 'react'
import { Bell } from 'lucide-react'
import { useCloseOnOutsideOrEscape } from '@/hooks/useCloseOnOutsideOrEscape'
import type { ActivityEvent } from '@/lib/types'

export function NotificationsPanel({
  events,
  onSelectSolicitud,
  onMarkAsRead,
  onMarkAllAsRead,
}: {
  events: ActivityEvent[]
  onSelectSolicitud: (id: string) => void
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}) {
  const [open, setOpen] = useState(false)
  const panelRef = useCloseOnOutsideOrEscape<HTMLDivElement>(() => setOpen(false), open)

  const unreadCount = useMemo(() => events.filter((event) => !event.read).length, [events])
  // corta el número mostrado en el badge para que no crezca sin control con miles de eventos
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  function handleSelect(event: ActivityEvent) {
    if (!event.read) onMarkAsRead(event.id)
    if (event.solicitudId) onSelectSolicitud(event.solicitudId)
    setOpen(false)
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="relative text-slate-400 hover:text-white"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-[#090d14]">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-white/10 bg-[#111925] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
            <span className="text-xs font-semibold text-white">Notificaciones</span>
            {unreadCount > 0 && (
              <button onClick={onMarkAllAsRead} className="text-[10px] font-medium text-indigo-300 hover:text-indigo-200">
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-80 divide-y divide-white/[0.05] overflow-y-auto">
            {events.length === 0 && (
              <div className="p-5 text-center text-[11px] text-slate-500">Sin notificaciones.</div>
            )}

            {events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleSelect(event)}
                className={`flex w-full gap-3 p-3.5 text-left transition hover:bg-white/[0.025] ${
                  event.read ? '' : 'bg-indigo-400/[0.04]'
                }`}
              >
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${event.tone}`}>
                  <event.icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-medium text-slate-300">{event.title}</p>
                    {!event.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />}
                  </div>
                  <p className="mt-0.5 truncate text-[10px] text-slate-500">{event.repo}</p>
                  <span className="text-[10px] text-slate-600">hace {event.time}</span>
                </div>
              </button>
            ))}
          </div>

          <button className="w-full border-t border-white/[0.07] py-2.5 text-[10px] font-medium text-indigo-300 hover:bg-white/[0.025]">
            Ver historial completo →
          </button>
        </div>
      )}
    </div>
  )
}
