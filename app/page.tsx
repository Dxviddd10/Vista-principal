'use client'

import { BookOpen, RefreshCw } from 'lucide-react'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'
import { Toast } from '@/components/Toast'
import { ActivityFeed } from '@/components/overview/ActivityFeed'
import { DetailModal } from '@/components/overview/DetailModal'
import { FlowTable } from '@/components/overview/FlowTable'
import { KpiCards } from '@/components/overview/KpiCards'
import { stages } from '@/lib/data'
import { useOverview } from '@/hooks/useOverview'
import { useRelativeTime } from '@/hooks/useRelativeTime'

export default function Page() {
  const {
    loading,
    fetching,
    refreshing,
    refresh,
    error,
    lastUpdatedAt,
    toastMessage,
    dismissToast,
    events,
    markAsRead,
    markAllAsRead,
    owners,
    solicitudes,
    total,
    kpis,
    stageFilter,
    setStageFilter,
    ownerFilter,
    setOwnerFilter,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    sortKey,
    sortAsc,
    toggleSort,
    selected,
    setSelectedId,
  } = useOverview()

  const relativeUpdatedAt = useRelativeTime(lastUpdatedAt)

  return (
    <main className="min-h-screen bg-[#090d14] text-slate-100">
      <Sidebar />

      <section className="lg:pl-[228px]">
        <Header
          search={search}
          onSearchChange={setSearch}
          events={events}
          onSelectSolicitud={setSelectedId}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
        />

        <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-300">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Operación en tiempo real
              </div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Estado de fuentes</h1>
              <p className="mt-1.5 text-sm text-slate-500">Monitorea el viaje de cada cambio hasta producción.</p>
            </div>
            <button
              onClick={() => refresh()}
              disabled={refreshing}
              className="flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Actualizando…' : relativeUpdatedAt}
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] px-5 py-4 text-xs text-rose-300">
              {error}
            </div>
          )}

          <KpiCards kpis={kpis} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <FlowTable
              loading={loading}
              fetching={fetching}
              solicitudes={solicitudes}
              total={total}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              owners={owners}
              stageFilter={stageFilter}
              onStageFilterChange={setStageFilter}
              ownerFilter={ownerFilter}
              onOwnerFilterChange={setOwnerFilter}
              sortKey={sortKey}
              sortAsc={sortAsc}
              onToggleSort={toggleSort}
              onSelect={setSelectedId}
            />
            <ActivityFeed loading={loading} events={events} onSelectSolicitud={setSelectedId} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-white/[0.07] bg-[#0e141f] px-5 py-4">
            <span className="text-[10px] uppercase tracking-wider text-slate-600">Etapas del flujo</span>
            {stages.map((stage) => (
              <div key={stage.key} className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className={`h-2 w-2 rounded-full ${stage.color}`} /> {stage.label}
              </div>
            ))}
            <div className="ml-auto hidden items-center gap-2 text-[10px] text-slate-600 sm:flex">
              <BookOpen size={13} /> Reglas de promoción activas
            </div>
          </div>
        </div>
      </section>

      {selected && <DetailModal solicitud={selected} onClose={() => setSelectedId(null)} />}
      <Toast message={toastMessage} onDismiss={dismissToast} />
    </main>
  )
}
