'use client'

import { useEffect, useRef, useState } from 'react'
import { GitCommitHorizontal, X } from 'lucide-react'
import { StageBadge } from './StageBadge'
import type { Solicitud } from '@/lib/types'

export function DetailModal({ solicitud, onClose }: { solicitud: Solicitud; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  // controla la transición de entrada: arranca en false y pasa a true un
  // instante después de montar, para que el CSS anime de opacity-0 -> 100
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // guarda qué elemento tenía el foco (la fila que se clickeó) para devolvérselo al cerrar
    previouslyFocused.current = document.activeElement as HTMLElement
    closeButtonRef.current?.focus()

    const frame = requestAnimationFrame(() => setVisible(true))

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detalle de ${solicitud.name}`}
      className={`fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4 transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md rounded-2xl border border-white/10 bg-[#111925] p-6 shadow-2xl transition-all duration-200 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-indigo-300">Detalle de fuente</div>
            <h3 className="mt-1 text-lg font-semibold">{solicitud.name}</h3>
          </div>
          <button
            ref={closeButtonRef}
            aria-label="Cerrar"
            onClick={onClose}
            className="rounded text-slate-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400/60"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 space-y-3 text-xs">
          <div className="rounded-lg bg-indigo-400/[0.06] p-3">
            <div className="text-[10px] uppercase tracking-wider text-indigo-300">Código único del flujo</div>
            <div className="mt-1 font-mono text-sm font-semibold text-white">{solicitud.code}</div>
          </div>
          <div className="rounded-lg bg-white/[0.04] p-3">
            <span className="text-slate-500">Descripción</span>
            <p className="mt-2 leading-relaxed text-slate-300">{solicitud.description}</p>
          </div>
          <div className="flex justify-between rounded-lg bg-white/[0.04] p-3">
            <span className="text-slate-500">Estado actual</span>
            <StageBadge stage={solicitud.stage} />
          </div>
          <div className="flex justify-between rounded-lg bg-white/[0.04] p-3">
            <span className="text-slate-500">Rama de trabajo</span>
            <span className="text-slate-300">{solicitud.branch}</span>
          </div>
          <div className="flex justify-between rounded-lg bg-white/[0.04] p-3">
            <span className="text-slate-500">Responsable</span>
            <span className="text-slate-300">{solicitud.owner}</span>
          </div>

          {solicitud.commits && solicitud.commits.length > 0 && (
            <div className="rounded-lg bg-white/[0.04] p-3">
              <span className="text-slate-500">Últimos commits</span>
              <ul className="mt-2 space-y-2">
                {solicitud.commits.map((commit) => (
                  <li key={commit.hash} className="flex items-start gap-2">
                    <GitCommitHorizontal size={13} className="mt-0.5 shrink-0 text-slate-500" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-indigo-300">{commit.hash}</span>
                        <span className="text-[10px] text-slate-600">{commit.date}</span>
                      </div>
                      <p className="mt-0.5 truncate text-[11px] text-slate-300">{commit.message}</p>
                      <p className="text-[10px] text-slate-600">{commit.author}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg bg-indigo-500 py-2.5 text-xs font-semibold text-white hover:bg-indigo-400"
        >
          Abrir trazabilidad
        </button>
      </div>
    </div>
  )
}
