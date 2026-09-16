import { CircleCheck, GitCommitHorizontal, GitMerge, TriangleAlert } from 'lucide-react'
import { computeKpis } from './kpis'
import type { ActivityEvent, Kpis, PaginatedResult, Solicitud, SolicitudesQuery, Stage } from './types'

export const stages: Stage[] = [
  { key: 'development', label: 'Desarrollo', short: 'DEV', color: 'bg-sky-400', text: 'text-sky-300' },
  { key: 'review', label: 'Validación', short: 'QA', color: 'bg-amber-400', text: 'text-amber-300' },
  { key: 'testing', label: 'Pruebas', short: 'UAT', color: 'bg-violet-400', text: 'text-violet-300' },
  { key: 'production', label: 'Producción', short: 'PROD', color: 'bg-emerald-400', text: 'text-emerald-300' },
  { key: 'rollback', label: 'Rollback', short: 'RBK', color: 'bg-rose-400', text: 'text-rose-300' },
]

// --- Datos de ejemplo ---------------------------------------------------
// Esto simula lo que hoy serían filas de la BD / respuesta de la API de
// Solicitudes. Cuando ese módulo esté listo, esta constante desaparece y
// getSolicitudes() hace el fetch real (ver más abajo).
const mockSolicitudes: Solicitud[] = [
  {
    id: 'PRT-042',
    name: 'portal-ciudadano',
    code: 'PRT-042',
    owner: 'Camila Rojas',
    branch: 'feature/PRT-042-notificaciones',
    stage: 'testing',
    updated: 'hace 18 min',
    updatedAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    progress: 72,
    initials: 'CR',
    color: 'bg-violet-500',
    description: 'Ajuste de notificaciones para informar cambios de estado al ciudadano.',
    commits: [
      { hash: 'a3f91c2', message: 'Agrega plantilla de notificación push', author: 'Camila Rojas', date: 'hace 18 min' },
      { hash: 'e12b7aa', message: 'Ajusta textos de estado en español', author: 'Camila Rojas', date: 'hace 3 h' },
    ],
  },
  {
    id: 'DOC-118',
    name: 'gestion-documental',
    code: 'DOC-118',
    owner: 'Andrés Pardo',
    branch: 'feature/DOC-118-firma-digital',
    stage: 'development',
    updated: 'hace 42 min',
    updatedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    progress: 44,
    initials: 'AP',
    color: 'bg-sky-500',
    description: 'Incorporación de firma digital en documentos oficiales y sus anexos.',
    commits: [
      { hash: 'c88d10f', message: 'Integra librería de firma digital', author: 'Andrés Pardo', date: 'hace 42 min' },
    ],
  },
  {
    id: 'FAC-073',
    name: 'facturacion-electronica',
    code: 'FAC-073',
    owner: 'Laura Méndez',
    branch: 'hotfix/FAC-073-iva',
    stage: 'production',
    updated: 'hace 1 h',
    updatedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    progress: 100,
    initials: 'LM',
    color: 'bg-emerald-500',
    description: 'Corrección del cálculo de IVA para operaciones exentas.',
    commits: [
      { hash: 'f2a44b1', message: 'Corrige cálculo de IVA en operaciones exentas', author: 'Laura Méndez', date: 'hace 1 h' },
      { hash: '9d0c3aa', message: 'Agrega pruebas unitarias del cálculo', author: 'Laura Méndez', date: 'hace 2 h' },
    ],
  },
  {
    id: 'INV-029',
    name: 'inventario-central',
    code: 'INV-029',
    owner: 'Diego Salas',
    branch: 'feature/INV-029-alertas',
    stage: 'review',
    updated: 'hace 2 h',
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    progress: 58,
    initials: 'DS',
    color: 'bg-amber-500',
    description: 'Alertas de inventario bajo para los responsables de cada bodega.',
    commits: [
      { hash: '77bb90e', message: 'Agrega umbral configurable de alerta', author: 'Diego Salas', date: 'hace 2 h' },
    ],
  },
  {
    id: 'ID-204',
    name: 'identidad-digital',
    code: 'ID-204',
    owner: 'Sofía Torres',
    branch: 'feature/ID-204-sso',
    stage: 'rollback',
    updated: 'hace 3 h',
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    progress: 31,
    initials: 'ST',
    color: 'bg-rose-500',
    description: 'Revisión del inicio de sesión único luego de una regresión en producción.',
    commits: [
      { hash: '4e0f1aa', message: 'Revierte cambio de proveedor SSO', author: 'Sofía Torres', date: 'hace 3 h' },
    ],
  },
]

const mockEvents: ActivityEvent[] = [
  { id: 'evt-1', icon: GitMerge, title: 'Merge request aprobado', repo: 'portal-ciudadano', detail: 'feature/PRT-042 → pruebas', time: '18 min', tone: 'text-violet-300 bg-violet-400/10', solicitudId: 'PRT-042', read: false },
  { id: 'evt-2', icon: GitCommitHorizontal, title: 'Nuevo commit', repo: 'gestion-documental', detail: 'feature/DOC-118-firma-digital', time: '42 min', tone: 'text-sky-300 bg-sky-400/10', solicitudId: 'DOC-118', read: false },
  { id: 'evt-3', icon: CircleCheck, title: 'Despliegue exitoso', repo: 'facturacion-electronica', detail: 'producción · v2.8.1', time: '1 h', tone: 'text-emerald-300 bg-emerald-400/10', solicitudId: 'FAC-073', read: true },
  { id: 'evt-4', icon: TriangleAlert, title: 'Rollback solicitado', repo: 'identidad-digital', detail: 'producción → pruebas', time: '3 h', tone: 'text-rose-300 bg-rose-400/10', solicitudId: 'ID-204', read: false },
]

// --- "API" simulada -------------------------------------------------------
// Estas funciones son el ÚNICO punto que debe cambiar cuando el módulo de
// Solicitudes (o la integración con GitHub/GitLab) esté listo: reemplaza
// el cuerpo por un fetch('/api/...') real, manteniendo la misma firma y
// forma de retorno. Ya están pensadas para trabajar con volumen grande de
// datos (paginación, filtros del lado del servidor, KPIs agregados),
// aunque hoy paginen "a mano" sobre el arreglo mockeado de arriba.

const NETWORK_DELAY_MS = 300

// Trae una página de solicitudes ya filtrada. Cuando exista el backend real,
// esto pasa a ser: fetch(`/api/solicitudes?${new URLSearchParams(query)}`)
export async function getSolicitudes(query: SolicitudesQuery): Promise<PaginatedResult<Solicitud>> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))

  const { page, pageSize, stage, owner, search, sortKey, sortAsc = true } = query
  const term = search?.toLowerCase().trim()

  // En el backend real, este filtrado sería una consulta a la base de datos
  // (WHERE stage = ... AND owner = ... AND ... ILIKE ...), no un .filter() en memoria.
  const filtered = mockSolicitudes.filter((s) => {
    const matchesStage = !stage || stage === 'Todos' || s.stage === stage.toLowerCase()
    const matchesOwner = !owner || owner === 'Todos' || s.owner === owner
    const matchesSearch =
      !term || [s.name, s.code, s.branch, s.owner, s.description].some((value) => value.toLowerCase().includes(term))
    return matchesStage && matchesOwner && matchesSearch
  })

  // El orden se aplica ANTES de paginar (equivalente a un ORDER BY en la
  // consulta): ordenar solo la página visible daría un resultado engañoso.
  if (sortKey) {
    filtered.sort((a, b) => {
      let result = 0
      if (sortKey === 'progress') result = a.progress - b.progress
      if (sortKey === 'updatedAt') result = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      if (sortKey === 'owner') result = a.owner.localeCompare(b.owner)
      return sortAsc ? result : -result
    })
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)

  return { items, total }
}

// Lista de responsables únicos para el filtro. En el backend real sería
// un SELECT DISTINCT owner, no algo que dependa de tener todo cargado.
export async function getOwners(): Promise<string[]> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  return ['Todos', ...new Set(mockSolicitudes.map((s) => s.owner))]
}

// KPIs agregados. Importante: se calculan sobre TODAS las solicitudes,
// no solo sobre la página visible en pantalla. En el backend real esto
// sería un COUNT/agregación en la base de datos.
export async function getKpis(): Promise<Kpis> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  return computeKpis(mockSolicitudes)
}

// Solo trae los últimos `limit` eventos, nunca el historial completo.
// "Ver historial completo" debería llevar a una vista aparte, paginada.
export async function getActivityEvents(limit = 15): Promise<ActivityEvent[]> {
  await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS))
  return mockEvents.slice(0, limit)
}

// Estas dos simulan un PATCH al backend marcando eventos como leídos.
// Mutan mockEvents directamente para que la próxima llamada a getActivityEvents
// ya refleje el cambio (igual que pasaría con una base de datos real).
export async function markEventAsRead(id: string): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  const event = mockEvents.find((e) => e.id === id)
  if (event) event.read = true
}

export async function markAllEventsAsRead(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150))
  mockEvents.forEach((e) => {
    e.read = true
  })
}
