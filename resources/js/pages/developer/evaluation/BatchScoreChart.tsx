import { Star } from 'lucide-react'
import type { BatchAnswerStat } from './evaluationUtils'

export function BatchScoreChart({ stats }: { stats: BatchAnswerStat[] }) {
  const withAnswers = stats.filter((s) => s.totalAnswers > 0).sort((a, b) => b.averageScore - a.averageScore)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="mb-0.5 text-sm font-semibold text-ink">Average trainer rating by batch</h2>
      <p className="mb-4 text-xs text-neutral-500">Based on submitted trainer evaluations per batch</p>

      {withAnswers.length === 0 ? (
        <p className="py-8 text-center text-xs text-neutral-400">No evaluation responses yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {withAnswers.slice(0, 6).map((s) => (
            <div key={s.batch.id} className="flex items-center gap-3">
              <span className="w-24 shrink-0 truncate font-mono text-xs font-medium text-ink">{s.batch.batchNo}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-pill bg-neutral-100">
                <div
                  className="h-full rounded-pill bg-brand-500 transition-all"
                  style={{ width: `${(s.averageScore / 5) * 100}%` }}
                />
              </div>
              <span className="flex w-10 shrink-0 items-center justify-end gap-0.5 text-xs font-semibold text-ink">
                {s.averageScore.toFixed(1)} <Star size={10} className="fill-warning-400 text-warning-400" />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
