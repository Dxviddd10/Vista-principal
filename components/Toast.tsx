'use client'

import { useEffect, useState } from 'react'
import { CircleCheck } from 'lucide-react'

// Se muestra cuando `message` deja de ser null, y se autodesvanece a los
// pocos segundos. `key` (el propio message) sirve para reiniciar la animación
// si el usuario dispara dos refrescos seguidos con el mismo texto.
export function Toast({ message, onDismiss }: { message: string | null; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!message) return
    setVisible(true)
    const hideTimeout = setTimeout(() => setVisible(false), 2200)
    const dismissTimeout = setTimeout(onDismiss, 2500)
    return () => {
      clearTimeout(hideTimeout)
      clearTimeout(dismissTimeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message])

  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-40 -translate-x-1/2 transition-all duration-300 ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-[#111925] px-4 py-2.5 text-xs text-emerald-300 shadow-2xl">
        <CircleCheck size={15} />
        {message}
      </div>
    </div>
  )
}
