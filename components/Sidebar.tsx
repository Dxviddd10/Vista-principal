import { Activity, GitBranch, LayoutDashboard, Package, Settings, ShieldCheck, Users, GitPullRequest } from 'lucide-react'

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[228px] border-r border-white/[0.07] bg-[#0c111a] lg:flex lg:flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.07] px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 shadow-lg shadow-indigo-500/20">
          <GitBranch size={18} strokeWidth={2.5} />
        </div>
        <div>
          <div className="text-sm font-bold tracking-tight">SourceFlow</div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-slate-500">Control Center</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-6 text-sm">
        <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Workspace</div>
        <a className="flex items-center gap-3 rounded-lg bg-indigo-500/12 px-3 py-2.5 font-medium text-indigo-300" href="/">
          <LayoutDashboard size={17} /> Vista general
        </a>
        <a
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          href="/solicitudes"
        >
          <GitPullRequest size={17} /> Solicitudes{' '}
          <span className="ml-auto rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] text-amber-300">8</span>
        </a>
        <a
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          href="/repositorios"
        >
          <Package size={17} /> Repositorios
        </a>
        <a
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          href="/equipo"
        >
          <Users size={17} /> Equipo
        </a>
        <div className="mb-3 mt-8 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">Sistema</div>
        <a
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          href="/webhooks"
        >
          <Activity size={17} /> Webhooks
        </a>
        <a
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
          href="/configuracion"
        >
          <Settings size={17} /> Configuración
        </a>
      </nav>
      <div className="m-3 rounded-xl border border-indigo-400/15 bg-indigo-500/[0.07] p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-200">
          <ShieldCheck size={15} /> Todo bajo control
        </div>
        <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500">Tus repositorios están sincronizados con GitLab.</p>
        <div className="mt-3 flex items-center gap-2 text-[10px] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Webhook activo
        </div>
      </div>
    </aside>
  )
}
