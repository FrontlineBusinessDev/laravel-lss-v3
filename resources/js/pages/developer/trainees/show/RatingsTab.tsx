import { RatingInput } from '@/components/RatingInput';
import {
    RequiredHoursCompletedPill,
    TaskCompletedPill,
} from '@/components/RatingsBadges';
import { StatCard } from '@/components/StatCard';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import { getHoursProgress } from '@/lib/ratings';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';

export default function RatingsTab({ trainee }: { trainee: TraineeDetail }) {
    const ratedTasks = trainee.task_ratings.filter((r) => r.rating != null);
    const overall =
        ratedTasks.length > 0
            ? ratedTasks.reduce((sum, r) => sum + (r.rating ?? 0), 0) /
              ratedTasks.length
            : 0;
    const hours = getHoursProgress(
        trainee.completed_hours,
        trainee.required_hours,
    );

    return (
        <TraineesDetailLayout trainee={trainee}>
            <div className="flex flex-col gap-4" data-cy="ratings-tab-div-1">
                {hours.hoursComplete && (
                    <div data-cy="ratings-tab-div-hours-badge">
                        <RequiredHoursCompletedPill />
                    </div>
                )}

                <div
                    className="rounded-lg border border-neutral-200 bg-white p-5"
                    data-cy="ratings-tab-div-2"
                >
                    <div
                        className="mb-4 flex items-center justify-between"
                        data-cy="ratings-tab-div-3"
                    >
                        <h3
                            className="text-sm font-semibold text-ink"
                            data-cy="ratings-tab-h3-task-ratings"
                        >
                            Task ratings
                        </h3>
                        {ratedTasks.length > 0 && (
                            <StatCard
                                label="Overall task performance"
                                value={`${overall.toFixed(1)} / 100`}
                                tone="accent"
                                className="w-44"
                                data-cy="ratings-tab-stat-card-overall-task-performance"
                            />
                        )}
                    </div>

                    {trainee.task_ratings.length === 0 && (
                        <div
                            className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500"
                            data-cy="ratings-tab-div-no-task-ratings-recorded-yet"
                        >
                            No task ratings recorded yet.
                        </div>
                    )}

                    <div className="flex flex-col gap-3" data-cy="ratings-tab-div-7">
                        {trainee.task_ratings.map((r) => (
                            <div
                                key={r.id}
                                className="rounded-md border border-neutral-200 p-3.5"
                                data-cy="ratings-tab-div-8"
                            >
                                <div
                                    className="mb-1.5 flex flex-wrap items-center justify-between gap-2"
                                    data-cy="ratings-tab-div-9"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="text-sm font-medium text-ink"
                                            data-cy="ratings-tab-span-10"
                                        >
                                            {r.task_name ?? 'Untitled task'}
                                        </span>
                                        {r.rating != null && <TaskCompletedPill />}
                                    </div>
                                    <RatingInput
                                        value={r.rating ?? 0}
                                        size="sm"
                                        data-cy="ratings-tab-rating-input-11"
                                    />
                                </div>
                                {r.comments && (
                                    <p
                                        className="text-xs leading-relaxed text-neutral-600"
                                        data-cy="ratings-tab-p-12"
                                    >
                                        {r.comments}
                                    </p>
                                )}
                                <div
                                    className="mt-2 text-xs text-neutral-400"
                                    data-cy="ratings-tab-div-evaluated-by"
                                >
                                    {r.evaluator
                                        ? `Evaluated by ${r.evaluator.first_name} ${r.evaluator.last_name}`
                                        : 'Evaluator not recorded'}
                                    {r.rated_at ? ` on ${r.rated_at.slice(0, 10)}` : ''}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div
                    className="rounded-lg border border-neutral-200 bg-white p-5"
                    data-cy="ratings-tab-div-behavioral"
                >
                    <div
                        className="mb-4 flex items-center justify-between"
                        data-cy="ratings-tab-div-behavioral-header"
                    >
                        <h3
                            className="text-sm font-semibold text-ink"
                            data-cy="ratings-tab-h3-behavioral-ratings"
                        >
                            Behavioral ratings
                        </h3>
                        {trainee.behavioral_evaluations.length > 0 && (
                            <StatCard
                                label="Overall behavioral score"
                                value={`${(trainee.behavioral_evaluations[0].total_score ?? 0).toFixed(1)} / 100`}
                                tone="accent"
                                className="w-44"
                                data-cy="ratings-tab-stat-card-overall-behavioral-score"
                            />
                        )}
                    </div>

                    {trainee.behavioral_evaluations.length === 0 && (
                        <div
                            className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500"
                            data-cy="ratings-tab-div-no-behavioral-ratings-recorded-yet"
                        >
                            No behavioral evaluation recorded yet.
                        </div>
                    )}

                    {trainee.behavioral_evaluations.map((evaluation) => (
                        <div
                            key={evaluation.id}
                            className="flex flex-col gap-3"
                            data-cy="ratings-tab-div-behavioral-evaluation"
                        >
                            {evaluation.answers.map((answer) => (
                                <div
                                    key={answer.id}
                                    className="rounded-md border border-neutral-200 p-3.5"
                                    data-cy="ratings-tab-div-behavioral-answer"
                                >
                                    <div
                                        className="mb-1.5 flex flex-wrap items-center justify-between gap-2"
                                        data-cy="ratings-tab-div-behavioral-answer-header"
                                    >
                                        <span
                                            className="text-sm font-medium text-ink"
                                            data-cy="ratings-tab-span-behavioral-question"
                                        >
                                            {answer.question?.question ?? 'Untitled question'}
                                        </span>
                                        {answer.question?.type === 'rating' && (
                                            <RatingInput
                                                value={answer.score ?? 0}
                                                size="sm"
                                                data-cy="ratings-tab-rating-input-behavioral"
                                            />
                                        )}
                                    </div>
                                    {answer.text_answer && (
                                        <p
                                            className="text-xs leading-relaxed text-neutral-600"
                                            data-cy="ratings-tab-p-behavioral-text-answer"
                                        >
                                            {answer.text_answer}
                                        </p>
                                    )}
                                </div>
                            ))}
                            {evaluation.remarks && (
                                <div
                                    className="rounded-md border border-neutral-200 bg-neutral-50 p-3.5 text-xs text-neutral-600"
                                    data-cy="ratings-tab-div-behavioral-remarks"
                                >
                                    <span className="font-medium text-ink">Remarks: </span>
                                    {evaluation.remarks}
                                </div>
                            )}
                            <div
                                className="text-xs text-neutral-400"
                                data-cy="ratings-tab-div-behavioral-evaluated-by"
                            >
                                {evaluation.evaluator
                                    ? `Evaluated by ${evaluation.evaluator.first_name} ${evaluation.evaluator.last_name}`
                                    : 'Evaluator not recorded'}
                                {evaluation.updated_at ? ` on ${evaluation.updated_at.slice(0, 10)}` : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </TraineesDetailLayout>
    );
}
