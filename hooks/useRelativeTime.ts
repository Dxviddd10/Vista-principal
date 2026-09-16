'use client'

import { useEffect, useState } from 'react'

function formatRelative(date: Date | null): string {
  if (!date) return 'Sin datos aún'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 10) return 'Actualizado justo ahora'
  if (seconds < 60) return `Actualizado hace ${seconds} seg`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Actualizado hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `Actualizado hace ${hours} h`
}

// Recalcula el texto cada 10s para que "hace 2 min" avance solo, sin
// necesidad de volver a pedir datos.
export function useRelativeTime(date: Date | null): string {
  const [, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10_000)
    return () => clearInterval(interval)
  }, [])

  return formatRelative(date)
}
