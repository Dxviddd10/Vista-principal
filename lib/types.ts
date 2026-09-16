import type { LucideIcon } from 'lucide-react'

// Etapas del flujo de despliegue. Si el equipo agrega/renombra etapas,
// este es el único lugar que hay que tocar (StageBadge y filtros lo leen de aquí).
export type StageKey = 'development' | 'review' | 'testing' | 'production' | 'rollback'

export interface Stage {
  key: StageKey
  label: string
  short: string
  color: string
  text: string
}

// Forma de dato que representa una "Solicitud" (merge/pull request en curso).
// Este es el contrato que debería compartirse con el módulo de Solicitudes:
// cuando ese módulo exista de verdad, getSolicitudes() en lib/data.ts es
// el único lugar que hay que cambiar para que traiga datos reales.
export interface Solicitud {
  id: string
  name: string
  code: string
  owner: string
  branch: string
  stage: StageKey
  updated: string
  updatedAt: string // ISO date, para poder calcular KPIs como "despliegues hoy"
  progress: number
  initials: string
  color: string
  description: string
  commits?: Commit[]
}

export interface Commit {
  hash: string
  message: string
  author: string
  date: string
}

export interface ActivityEvent {
  id: string
  icon: LucideIcon
  title: string
  repo: string
  detail: string
  time: string
  tone: string
  solicitudId?: string // permite enlazar el evento a su solicitud (para abrir el modal)
  read: boolean
}

// Parámetros que en el futuro viajarán al backend/API real. Se usan ya
// ahora, aunque getSolicitudes() los aplique "a mano" sobre el mock,
// para que la interfaz no tenga que cambiar cuando exista el backend.
export type SortKey = 'progress' | 'updatedAt' | 'owner'

export interface SolicitudesQuery {
  page: number
  pageSize: number
  stage?: string
  owner?: string
  search?: string
  sortKey?: SortKey
  sortAsc?: boolean
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
}

export interface Kpis {
  enMovimiento: number
  enValidacion: number
  requierenRevision: number
  desplieguesHoy: number
  porcentajeExitosos: number
  alertasAbiertas: number
  alertasCriticas: number
}
