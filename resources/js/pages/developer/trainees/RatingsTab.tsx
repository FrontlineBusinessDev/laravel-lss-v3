import type { Trainee } from '@/types'
import { StatCard } from '@/components/StatCard'
import { RatingStars } from '@/components/RatingStars'
import { RatingInput } from '@/components/RatingInput'
import { behavioralRatingRecords } from '@/data/mockData'

export function RatingsTab({ trainee }: { trainee: Trainee }) {
  const overall =
    trainee.taskRatings.length > 0
      ? trainee.taskRatings.reduce((sum, r) => sum + r.rating, 0) / trainee.taskRatings.length
      : 0

  const behavioral = behavioralRatingRecords.find((r) => r.batchNo === trainee.batchNo && r.traineeId === trainee.id)
  const behavioralScores = behavioral ? behavioral.answers.filter((a) => a.score != null) : []
  const behavioralAvg = behavioralScores.length
    ? behavioralScores.reduce((sum, a) => sum + (a.score ?? 0), 0) / behavioralScores.length
    : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Task ratings</h3>
          {trainee.taskRatings.length > 0 && <StatCard label="Overall task performance" value={`${overall.toFixed(1)} / 100`} tone="accent" className="w-44" />}
        </div>

        {trainee.taskRatings.length === 0 && (
          <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
            No task ratings recorded yet.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {trainee.taskRatings.map((r) => (
            <div key={r.id} className="rounded-md border border-neutral-200 p-3.5">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{r.taskName}</span>
                <RatingInput value={r.rating} size="sm" />
              </div>
              <p className="text-xs leading-relaxed text-neutral-600">{r.comments}</p>
              <div className="mt-2 text-xs text-neutral-400">Evaluated by {r.evaluator}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink">Behavioral rating</h3>
          {behavioral && <RatingStars value={behavioralAvg} size={13} />}
        </div>
        {behavioral ? (
          <div className="rounded-md border border-neutral-200 p-3.5">
            {behavioral.overallComments && <p className="text-xs leading-relaxed text-neutral-600">{behavioral.overallComments}</p>}
            {behavioral.recommendation && (
              <p className="mt-2 text-xs italic leading-relaxed text-neutral-500">Recommendation: {behavioral.recommendation}</p>
            )}
            <div className="mt-2 text-xs text-neutral-400">
              Evaluated by {behavioral.evaluator} on {behavioral.ratedAt}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
            No behavioral rating recorded for this trainee.
          </div>
        )}
      </div>
    </div>
  )
}
