'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { getActivityEvents, getKpis, getOwners, getSolicitudes, markAllEventsAsRead, markEventAsRead } from '@/lib/data'
import type { ActivityEvent, Kpis, Solicitud, SortKey } from '@/lib/types'

const PAGE_SIZE = 5
const SEARCH_DEBOUNCE_MS = 300

export function useOverview() {
  // datos
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([])
  const [total, setTotal] = useState(0)
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [owners, setOwners] = useState<string[]>(['Todos'])
  const [kpis, setKpis] = useState<Kpis | null>(null)

  // carga: `loading` solo es true la primera vez (pantalla vacía),
  // `fetching` es true en cada refetch posterior (para no volver a mostrar
  // el skeleton completo cuando solo cambias de página o de filtro)
  const [loading, setLoading] = useState(true)
  const [fetching, setFetching] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // filtros y paginación
  const [stageFilter, setStageFilter] = useState('Todos')
  const [ownerFilter, setOwnerFilter] = useState('Todos')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc((asc) => !asc)
    } else {
      setSortKey(key)
      setSortAsc(true)
    }
  }

  // debounce: espera a que el usuario deje de escribir antes de "consultar"
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [search])

  // si cambia cualquier filtro, vuelve a la página 1 (si no, podrías quedar
  // en una página que ya no existe para el nuevo filtro)
  useEffect(() => {
    setPage(1)
  }, [stageFilter, ownerFilter, debouncedSearch, sortKey, sortAsc])

  // carga inicial: owners y KPIs, que no dependen de filtros ni de página
  useEffect(() => {
    let isMounted = true
    Promise.all([getOwners(), getKpis()])
      .then(([ownersData, kpisData]) => {
        if (!isMounted) return
        setOwners(ownersData)
        setKpis(kpisData)
      })
      .catch(() => {
        if (!isMounted) return
        setError('No se pudieron cargar los indicadores. Intenta nuevamente.')
      })
    return () => {
      isMounted = false
    }
  }, [])

  // eventos recientes: se cargan una sola vez (solo los últimos N, no el historial completo)
  useEffect(() => {
    let isMounted = true
    getActivityEvents(15).then((data) => {
      if (isMounted) setEvents(data)
    })
    return () => {
      isMounted = false
    }
  }, [])

  // actualización optimista: marca en el estado local de inmediato y confirma
  // contra el "backend" simulado; si algo falla, no revertimos porque es un
  // cambio de bajo riesgo (a lo sumo el usuario vuelve a verlo como no leído
  // en el próximo refresco)
  function markAsRead(id: string) {
    setEvents((current) => current.map((event) => (event.id === id ? { ...event, read: true } : event)))
    markEventAsRead(id).catch(() => {})
  }

  function markAllAsRead() {
    setEvents((current) => current.map((event) => ({ ...event, read: true })))
    markAllEventsAsRead().catch(() => {})
  }

  // solicitudes paginadas: se recarga cada vez que cambian filtros o página
  useEffect(() => {
    let isMounted = true
    setFetching(true)
    setError(null)

    getSolicitudes({
      page,
      pageSize: PAGE_SIZE,
      stage: stageFilter,
      owner: ownerFilter,
      search: debouncedSearch,
      sortKey: sortKey ?? undefined,
      sortAsc,
    })
      .then(({ items, total: totalCount }) => {
        if (!isMounted) return
        setSolicitudes(items)
        setTotal(totalCount)
        setLastUpdatedAt(new Date())
      })
      .catch(() => {
        if (!isMounted) return
        setError('No se pudieron cargar las solicitudes. Intenta nuevamente.')
      })
      .finally(() => {
        if (!isMounted) return
        setFetching(false)
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [page, stageFilter, ownerFilter, debouncedSearch, sortKey, sortAsc])

  // Refresco manual (botón "Actualizado hace X") o automático en segundo
  // plano cada 2 minutos (ver el useEffect más abajo). `silent` evita el
  // spinner/disabled del botón y el toast cuando el refresco es automático,
  // para no interrumpir al usuario cada 2 minutos con feedback visual.
  async function refresh(options: { silent?: boolean } = {}) {
    const { silent = false } = options
    if (!silent) setRefreshing(true)
    setError(null)
    try {
      const [ownersData, kpisData, eventsData, solicitudesResult] = await Promise.all([
        getOwners(),
        getKpis(),
        getActivityEvents(15),
        getSolicitudes({
          page,
          pageSize: PAGE_SIZE,
          stage: stageFilter,
          owner: ownerFilter,
          search: debouncedSearch,
          sortKey: sortKey ?? undefined,
          sortAsc,
        }),
      ])
      setOwners(ownersData)
      setKpis(kpisData)
      setEvents(eventsData)
      setSolicitudes(solicitudesResult.items)
      setTotal(solicitudesResult.total)
      setLastUpdatedAt(new Date())
      if (!silent) setToastMessage('Datos actualizados')
    } catch {
      if (!silent) setError('No se pudo actualizar. Intenta nuevamente.')
    } finally {
      if (!silent) setRefreshing(false)
    }
  }

  // Mantiene siempre la versión más reciente de refresh() disponible dentro
  // del intervalo, sin tener que recrear el setInterval cada vez que cambian
  // filtros/página (que harían que refresh cambie de identidad en cada render).
  const refreshRef = useRef(refresh)
  refreshRef.current = refresh

  // Auto-refresco cada 2 minutos: la decisión del equipo fue NO usar
  // tiempo real (websockets/polling agresivo) por el volumen alto de
  // solicitudes; 2 minutos es un intervalo razonable para no sobrecargar
  // el backend ni al navegador, y suficiente para que el panel no se sienta desactualizado.
  const AUTO_REFRESH_MS = 2 * 60 * 1000
  useEffect(() => {
    const interval = setInterval(() => {
      refreshRef.current({ silent: true })
    }, AUTO_REFRESH_MS)
    return () => clearInterval(interval)
  }, [])

  const selected = useMemo(() => solicitudes.find((s) => s.id === selectedId) ?? null, [solicitudes, selectedId])
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  return {
    loading,
    fetching,
    refreshing,
    refresh,
    error,
    lastUpdatedAt,
    toastMessage,
    dismissToast: () => setToastMessage(null),
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
    pageSize: PAGE_SIZE,
    sortKey,
    sortAsc,
    toggleSort,
    selected,
    selectedId,
    setSelectedId,
  }
}
