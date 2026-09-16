import { stages } from '@/lib/data'
import type { StageKey } from '@/lib/types'

export function StageBadge({ stage }: { stage: StageKey }) {
  const item = stages.find((entry) => entry.key === stage) ?? stages[0]
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-white/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${item.text} bg-white/[0.03]`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
      {item.label}
    </span>
  )
}
