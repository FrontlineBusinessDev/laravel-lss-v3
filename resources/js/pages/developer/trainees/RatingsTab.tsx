import type { Trainee } from '@/types';
import { StatCard } from '@/components/StatCard';
import { RatingStars } from '@/components/RatingStars';
import { RatingInput } from '@/components/RatingInput';
import { behavioralRatingRecords } from '@/data/mockData';
export function RatingsTab({
  trainee
}: {
  trainee: Trainee;
}) {
  const overall = trainee.taskRatings.length > 0 ? trainee.taskRatings.reduce((sum, r) => sum + r.rating, 0) / trainee.taskRatings.length : 0;
  const behavioral = behavioralRatingRecords.find(r => r.batchNo === trainee.batchNo && r.traineeId === trainee.id);
  const behavioralScores = behavioral ? behavioral.answers.filter(a => a.score != null) : [];
  const behavioralAvg = behavioralScores.length ? behavioralScores.reduce((sum, a) => sum + (a.score ?? 0), 0) / behavioralScores.length : 0;
  return <div className="flex flex-col gap-4" data-cy="ratings-tab-div-1">
      <div className="rounded-lg border border-neutral-200 bg-white p-5" data-cy="ratings-tab-div-2">
        <div className="mb-4 flex items-center justify-between" data-cy="ratings-tab-div-3">
          <h3 className="text-sm font-semibold text-ink" data-cy="ratings-tab-h3-task-ratings">Task ratings</h3>
          {trainee.taskRatings.length > 0 && <StatCard label="Overall task performance" value={`${overall.toFixed(1)} / 100`} tone="accent" className="w-44" data-cy="ratings-tab-stat-card-overall-task-performance" />}
        </div>

        {trainee.taskRatings.length === 0 && <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500" data-cy="ratings-tab-div-no-task-ratings-recorded-yet">
            No task ratings recorded yet.
          </div>}

        <div className="flex flex-col gap-3" data-cy="ratings-tab-div-7">
          {trainee.taskRatings.map(r => <div key={r.id} className="rounded-md border border-neutral-200 p-3.5" data-cy="ratings-tab-div-8">
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2" data-cy="ratings-tab-div-9">
                <span className="text-sm font-medium text-ink" data-cy="ratings-tab-span-10">{r.taskName}</span>
                <RatingInput value={r.rating} size="sm" data-cy="ratings-tab-rating-input-11" />
              </div>
              <p className="text-xs leading-relaxed text-neutral-600" data-cy="ratings-tab-p-12">{r.comments}</p>
              <div className="mt-2 text-xs text-neutral-400" data-cy="ratings-tab-div-evaluated-by">Evaluated by {r.evaluator}</div>
            </div>)}
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-5" data-cy="ratings-tab-div-14">
        <div className="mb-3 flex items-center justify-between" data-cy="ratings-tab-div-15">
          <h3 className="text-sm font-semibold text-ink" data-cy="ratings-tab-h3-behavioral-rating">Behavioral rating</h3>
          {behavioral && <RatingStars value={behavioralAvg} size={13} data-cy="ratings-tab-rating-stars-17" />}
        </div>
        {behavioral ? <div className="rounded-md border border-neutral-200 p-3.5" data-cy="ratings-tab-div-18">
            {behavioral.overallComments && <p className="text-xs leading-relaxed text-neutral-600" data-cy="ratings-tab-p-19">{behavioral.overallComments}</p>}
            {behavioral.recommendation && <p className="mt-2 text-xs italic leading-relaxed text-neutral-500" data-cy="ratings-tab-p-recommendation">Recommendation: {behavioral.recommendation}</p>}
            <div className="mt-2 text-xs text-neutral-400" data-cy="ratings-tab-div-evaluated-by-2">
              Evaluated by {behavioral.evaluator} on {behavioral.ratedAt}
            </div>
          </div> : <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500" data-cy="ratings-tab-div-no-behavioral-rating-recorded-for-this">
            No behavioral rating recorded for this trainee.
          </div>}
      </div>
    </div>;
}