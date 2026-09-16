import type { ActivityEvent } from '@/lib/types'

export function ActivityFeed({
  loading,
  events,
  onSelectSolicitud,
}: {
  loading: boolean
  events: ActivityEvent[]
  onSelectSolicitud: (id: string) => void
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0e141f]">
      <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
        <div>
          <h2 className="text-sm font-semibold text-white">Actividad reciente</h2>
          <p className="mt-1 text-xs text-slate-500">Eventos recibidos desde GitLab</p>
        </div>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> En vivo
        </span>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-4">
              <div className="h-10 animate-pulse rounded bg-white/[0.04]" />
            </div>
          ))}

        {!loading && events.length === 0 && (
          <div className="p-5 text-center text-[11px] text-slate-500">Sin actividad reciente.</div>
        )}

        {!loading &&
          events.map((event) => (
            <button
              key={event.id}
              onClick={() => event.solicitudId && onSelectSolicitud(event.solicitudId)}
              className="flex w-full gap-3 p-4 text-left transition hover:bg-white/[0.025] disabled:cursor-default"
              disabled={!event.solicitudId}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${event.tone}`}>
                <event.icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <p className="text-[11px] font-medium text-slate-300">{event.title}</p>
                  <span className="whitespace-nowrap text-[10px] text-slate-600">{event.time}</span>
                </div>
                <p className="mt-1 truncate text-[10px] text-slate-500">{event.repo}</p>
                <p className="mt-1 truncate text-[10px] text-slate-600">{event.detail}</p>
              </div>
            </button>
          ))}
      </div>

      <button className="w-full border-t border-white/[0.07] py-3 text-[10px] font-medium text-indigo-300 hover:bg-white/[0.025]">
        Ver historial completo →
      </button>
    </div>
  )
}
