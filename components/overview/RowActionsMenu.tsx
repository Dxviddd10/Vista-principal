'use client'

import { useState } from 'react'
import { Copy, Eye, ExternalLink, MoreHorizontal } from 'lucide-react'
import { useCloseOnOutsideOrEscape } from '@/hooks/useCloseOnOutsideOrEscape'
import type { Solicitud } from '@/lib/types'

export function RowActionsMenu({
  solicitud,
  onViewDetail,
}: {
  solicitud: Solicitud
  onViewDetail: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useCloseOnOutsideOrEscape<HTMLDivElement>(() => setOpen(false), open)

  async function handleCopyBranch(event: React.MouseEvent) {
    event.stopPropagation()
    try {
      await navigator.clipboard.writeText(solicitud.branch)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard no disponible (p. ej. sin permisos); no bloquea el resto del flujo
    }
  }

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        aria-label="Más acciones"
        aria-expanded={open}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((value) => !value)
        }}
        className="rounded p-1 text-slate-600 hover:bg-white/5 hover:text-slate-300"
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          onClick={(event) => event.stopPropagation()}
          className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-lg border border-white/10 bg-[#111925] py-1 text-xs shadow-xl"
        >
          <button
            onClick={() => {
              onViewDetail(solicitud.id)
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-slate-300 hover:bg-white/5"
          >
            <Eye size={13} /> Ver detalle
          </button>
          <button
            onClick={handleCopyBranch}
            className="flex w-full items-center gap-2 px-3 py-2 text-slate-300 hover:bg-white/5"
          >
            <Copy size={13} /> {copied ? '¡Copiada!' : 'Copiar rama'}
          </button>
          {/* Cuando exista la integración real con GitHub/GitLab, este href
              debería construirse con la URL del repo + la rama (solicitud.branch). */}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault()
              setOpen(false)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-slate-500 hover:bg-white/5"
            title="Disponible cuando esté lista la integración con GitHub/GitLab"
          >
            <ExternalLink size={13} /> Abrir en GitLab
          </a>
        </div>
      )}
    </div>
  )
}
