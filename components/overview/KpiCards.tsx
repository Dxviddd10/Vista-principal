import { Activity, GitPullRequest, Package, TriangleAlert } from 'lucide-react'
import type { Kpis } from '@/lib/types'

function KpiCard({
  label,
  icon,
  value,
  hint,
  hintTone = 'text-slate-500',
}: {
  label: string
  icon: React.ReactNode
  value: number | string
  hint: string
  hintTone?: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0e141f] p-4">
      <div className="flex items-center justify-between text-xs text-slate-500">
        {label} {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      <div className={`mt-1 text-[11px] ${hintTone}`}>{hint}</div>
    </div>
  )
}

function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#0e141f] p-4">
      <div className="h-3 w-20 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-3 h-7 w-10 animate-pulse rounded bg-white/[0.06]" />
      <div className="mt-2 h-2.5 w-24 animate-pulse rounded bg-white/[0.04]" />
    </div>
  )
}

// kpis puede ser null mientras se resuelve el fetch (ver getKpis en lib/data.ts);
// se muestra un skeleton en vez de bloquear el resto de la Vista general.
export function KpiCards({ kpis }: { kpis: Kpis | null }) {
  if (!kpis) {
    return (
      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>
    )
  }

  return (
    <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KpiCard
        label="En movimiento"
        icon={<Activity size={15} className="text-indigo-300" />}
        value={kpis.enMovimiento}
        hint="fuera de producción"
      />
      <KpiCard
        label="En validación"
        icon={<GitPullRequest size={15} className="text-amber-300" />}
        value={kpis.enValidacion}
        hint={`${kpis.requierenRevision} requieren tu revisión`}
      />
      <KpiCard
        label="Despliegues hoy"
        icon={<Package size={15} className="text-emerald-300" />}
        value={kpis.desplieguesHoy}
        hint={`${kpis.porcentajeExitosos}% exitosos`}
        hintTone="text-emerald-300"
      />
      <KpiCard
        label="Alertas abiertas"
        icon={<TriangleAlert size={15} className="text-rose-300" />}
        value={kpis.alertasAbiertas}
        hint={kpis.alertasCriticas > 0 ? `${kpis.alertasCriticas} crítica(s)` : 'sin críticas'}
        hintTone={kpis.alertasCriticas > 0 ? 'text-rose-300' : 'text-slate-500'}
      />
    </div>
  )
}
