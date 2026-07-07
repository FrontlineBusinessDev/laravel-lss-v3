import { useState } from 'react'
import type { Trainee } from '@/types'
import { learningOutcomes } from '@/data/mockData'
import { cn } from '@/lib/utils'

export function LearningOutcomesTab({ trainee }: { trainee: Trainee }) {
  const [achieved, setAchieved] = useState(new Set(trainee.achievedOutcomeIds))

  const relevant = learningOutcomes.filter(
    (o) => o.industry.toLowerCase() === trainee.industry.toLowerCase() && o.status === 'active',
  )

  const toggle = (id: string) => {
    setAchieved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-ink">Learning outcomes</h3>
          <p className="text-xs text-neutral-500">Outcomes associated with {trainee.industry}. Select the ones achieved by the trainee.</p>
        </div>
        <span className="text-xs text-neutral-500">
          {achieved.size} / {relevant.length} achieved
        </span>
      </div>

      {relevant.length === 0 && (
        <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
          No learning outcomes configured for this industry.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {relevant.map((o) => {
          const checked = achieved.has(o.id)
          return (
            <label
              key={o.id}
              className={cn(
                'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors',
                checked ? 'border-brand-200 bg-brand-50' : 'border-neutral-200 hover:bg-neutral-50',
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(o.id)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500"
              />
              <span className={cn('text-sm', checked ? 'text-brand-800' : 'text-ink')}>{o.outcome}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
