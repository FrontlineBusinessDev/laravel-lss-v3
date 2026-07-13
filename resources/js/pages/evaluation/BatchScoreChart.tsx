import { Star } from 'lucide-react';
import type { BatchAnswerStat } from './evaluationUtils';
export function BatchScoreChart({
  stats
}: {
  stats: BatchAnswerStat[];
}) {
  const withAnswers = stats.filter(s => s.totalAnswers > 0).sort((a, b) => b.averageScore - a.averageScore);
  return <div className="rounded-lg border border-neutral-200 bg-white p-4" data-cy="batch-score-chart-div-1">
      <h2 className="mb-0.5 text-sm font-semibold text-ink" data-cy="batch-score-chart-h2-average-trainer-rating-by-batch">Average trainer rating by batch</h2>
      <p className="mb-4 text-xs text-neutral-500" data-cy="batch-score-chart-p-based-on-submitted-trainer-evaluations-per">Based on submitted trainer evaluations per batch</p>

      {withAnswers.length === 0 ? <p className="py-8 text-center text-xs text-neutral-400" data-cy="batch-score-chart-p-no-evaluation-responses-yet">No evaluation responses yet.</p> : <div className="flex flex-col gap-3" data-cy="batch-score-chart-div-5">
          {withAnswers.slice(0, 6).map(s => <div key={s.batch.id} className="flex items-center gap-3" data-cy="batch-score-chart-div-6">
              <span className="w-24 shrink-0 truncate font-mono text-xs font-medium text-ink" data-cy="batch-score-chart-span-7">{s.batch.batchNo}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-pill bg-neutral-100" data-cy="batch-score-chart-div-8">
                <div className="h-full rounded-pill bg-brand-500 transition-all" style={{
            width: `${s.averageScore / 5 * 100}%`
          }} data-cy="batch-score-chart-div-9" />
              </div>
              <span className="flex w-10 shrink-0 items-center justify-end gap-0.5 text-xs font-semibold text-ink" data-cy="batch-score-chart-span-10">
                {s.averageScore.toFixed(1)} <Star size={10} className="fill-warning-400 text-warning-400" data-cy="batch-score-chart-star-11" />
              </span>
            </div>)}
        </div>}
    </div>;
}