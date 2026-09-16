'use client'

import { ChevronLeft, ChevronRight, GitBranch } from 'lucide-react'
import { RowActionsMenu } from './RowActionsMenu'
import { StageBadge } from './StageBadge'
import type { Solicitud, SortKey } from '@/lib/types'

const stageFilterOptions = ['Todos', 'Development', 'Review', 'Testing', 'Production']

export function FlowTable({
  loading,
  fetching,
  solicitudes,
  total,
  page,
  totalPages,
  onPageChange,
  owners,
  stageFilter,
  onStageFilterChange,
  ownerFilter,
  onOwnerFilterChange,
  sortKey,
  sortAsc,
  onToggleSort,
  onSelect,
}: {
  loading: boolean
  fetching: boolean
  solicitudes: Solicitud[]
  total: number
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  owners: string[]
  stageFilter: string
  onStageFilterChange: (value: string) => void
  ownerFilter: string
  onOwnerFilterChange: (value: string) => void
  sortKey: SortKey | null
  sortAsc: boolean
  onToggleSort: (key: SortKey) => void
  onSelect: (id: string) => void
}) {
  const showSkeleton = loading
  const showEmpty = !loading && !fetching && solicitudes.length === 0

  return (
    <div className="min-w-0 rounded-xl border border-white/[0.07] bg-[#0e141f]">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Flujo de despliegues</h2>
          <p className="mt-1 text-xs text-slate-500">Cada fuente representa un cambio en curso.</p>
        </div>
        <div className="flex gap-1 rounded-lg bg-black/20 p-1">
          {stageFilterOptions.map((item) => (
            <button
              key={item}
              onClick={() => onStageFilterChange(item)}
              className={`rounded-md px-2.5 py-1.5 text-[10px] font-medium transition ${
                stageFilter === item ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {item === 'Todos'
                ? item
                : item === 'Development'
                  ? 'Dev'
                  : item === 'Review'
                    ? 'QA'
                    : item === 'Testing'
                      ? 'Pruebas'
                      : 'Prod'}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filtrar por responsable"
            value={ownerFilter}
            onChange={(event) => onOwnerFilterChange(event.target.value)}
            className="rounded-md border border-white/[0.08] bg-[#111925] px-2.5 py-1.5 text-[10px] text-slate-300 outline-none"
          >
            <option value="Todos">Todos los responsables</option>
            {owners.slice(1).map((owner) => (
              <option key={owner} value={owner}>
                {owner}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-600">{total} flujos</span>
        </div>
      </div>

      <div className={`overflow-x-auto transition-opacity ${fetching && !loading ? 'opacity-60' : 'opacity-100'}`}>
        <table className="w-full min-w-[700px] text-left">
          <thead>
            <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-wider text-slate-600">
              <th className="px-5 py-3 font-medium">Fuente / responsable</th>
              <th className="cursor-pointer select-none px-3 py-3 font-medium" onClick={() => onToggleSort('progress')}>
                Progreso {sortKey === 'progress' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th className="px-3 py-3 font-medium">Etapa actual</th>
              <th
                className="cursor-pointer select-none px-3 py-3 font-medium"
                onClick={() => onToggleSort('updatedAt')}
              >
                Última actividad {sortKey === 'updatedAt' ? (sortAsc ? '↑' : '↓') : ''}
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {showSkeleton &&
              Array.from({ length: 4 }).map((_, index) => (
                <tr key={index} className="border-b border-white/[0.05]">
                  <td className="px-5 py-4" colSpan={5}>
                    <div className="h-8 animate-pulse rounded bg-white/[0.04]" />
                  </td>
                </tr>
              ))}

            {showEmpty && (
              <tr>
                <td className="px-5 py-10 text-center text-xs text-slate-500" colSpan={5}>
                  No hay fuentes que coincidan con estos filtros.
                </td>
              </tr>
            )}

            {!showSkeleton &&
              solicitudes.map((solicitud) => (
                <tr
                  key={solicitud.id}
                  onClick={() => onSelect(solicitud.id)}
                  className="cursor-pointer border-b border-white/[0.05] transition hover:bg-white/[0.025]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold text-white ${solicitud.color}`}
                      >
                        {solicitud.initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                          <span>{solicitud.name}</span>
                          <span className="rounded bg-indigo-400/10 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-indigo-300">
                            {solicitud.code}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500">
                          <GitBranch size={11} /> {solicitud.branch}
                        </div>
                        <p className="mt-1 max-w-[320px] truncate text-[10px] text-slate-600" title={solicitud.description}>
                          {solicitud.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                        <div
                          className={`h-full rounded-full ${solicitud.progress === 100 ? 'bg-emerald-400' : 'bg-indigo-400'}`}
                          style={{ width: `${solicitud.progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-500">{solicitud.progress}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <StageBadge stage={solicitud.stage} />
                  </td>
                  <td className="px-3 py-4 text-[11px] text-slate-500">{solicitud.updated}</td>
                  <td className="px-4 py-4 text-right">
                    <RowActionsMenu solicitud={solicitud} onViewDetail={onSelect} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 text-[10px] text-slate-600">
        <span>
          Página {page} de {totalPages} · {total} fuentes en total
        </span>
        <div className="flex items-center gap-1">
          <button
            aria-label="Página anterior"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            aria-label="Página siguiente"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded p-1 text-slate-400 hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
