import type { Kpis, Solicitud } from './types'

const MS_EN_24H = 24 * 60 * 60 * 1000

export function computeKpis(solicitudes: Solicitud[]): Kpis {
  const now = Date.now()

  const enMovimiento = solicitudes.filter((s) => s.stage !== 'production').length
  const enValidacion = solicitudes.filter((s) => s.stage === 'review').length
  // heurística simple: una solicitud "requiere revisión" si lleva en review
  // y su progreso todavía no llegó al 100%. Cuando exista un campo real de
  // aprobaciones pendientes en la API, esto se reemplaza por ese dato.
  const requierenRevision = solicitudes.filter((s) => s.stage === 'review' && s.progress < 100).length

  const desplegadasHoy = solicitudes.filter(
    (s) => s.stage === 'production' && now - new Date(s.updatedAt).getTime() <= MS_EN_24H,
  )
  const desplieguesHoy = desplegadasHoy.length

  const rollbacks = solicitudes.filter((s) => s.stage === 'rollback')
  const alertasAbiertas = rollbacks.length
  const alertasCriticas = rollbacks.filter((s) => s.progress < 50).length

  const totalConsideradas = desplieguesHoy + alertasAbiertas
  const porcentajeExitosos = totalConsideradas === 0 ? 100 : Math.round((desplieguesHoy / totalConsideradas) * 100)

  return {
    enMovimiento,
    enValidacion,
    requierenRevision,
    desplieguesHoy,
    porcentajeExitosos,
    alertasAbiertas,
    alertasCriticas,
  }
}
