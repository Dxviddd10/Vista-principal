'use client'

import { useEffect, useRef } from 'react'

/**
 * Llama a onClose cuando el usuario hace click fuera del elemento referenciado
 * o presiona Escape. Úsalo en cualquier menú, dropdown o modal.
 *
 * const ref = useCloseOnOutsideOrEscape<HTMLDivElement>(() => setOpen(false))
 * <div ref={ref}>...</div>
 */
export function useCloseOnOutsideOrEscape<T extends HTMLElement>(onClose: () => void, active = true) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!active) return

    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [active, onClose])

  return ref
}
