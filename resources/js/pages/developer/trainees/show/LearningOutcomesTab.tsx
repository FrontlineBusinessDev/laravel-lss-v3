import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import { useTraineeOutcomeToggle } from '@/hooks/use-trainee-outcome-toggle';
import { cn } from '@/lib/utils';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';

export default function LearningOutcomesTab({ trainee }: { trainee: TraineeDetail }) {
    const { isAchieved, toggle, toggleAll, savingId } = useTraineeOutcomeToggle(trainee.id);
    const outcomes = trainee.outcomes ?? [];
    const achievedCount = outcomes.filter(isAchieved).length;

    return (
        <>
            <TraineesDetailLayout trainee={trainee}>
                <div
                    className="rounded-lg border border-neutral-200 bg-white p-5"
                    data-cy="learning-outcomes-tab-div-1"
                >
                    <div
                        className="mb-4 flex items-center justify-between"
                        data-cy="learning-outcomes-tab-div-2"
                    >
                        <div data-cy="learning-outcomes-tab-div-3">
                            <h3
                                className="text-sm font-semibold text-ink"
                                data-cy="learning-outcomes-tab-h3-learning-outcomes"
                            >
                                Learning outcomes
                            </h3>
                            <p
                                className="text-xs text-neutral-500"
                                data-cy="learning-outcomes-tab-p-outcomes-associated-with"
                            >
                                Outcomes associated with {trainee.batch?.academic_industry?.name ?? 'this industry'}.
                                Select the ones achieved by the trainee.
                            </p>
                        </div>
                        <div
                            className="flex items-center gap-3"
                            data-cy="learning-outcomes-tab-div-actions"
                        >
                            <span
                                className="text-xs text-neutral-500"
                                data-cy="learning-outcomes-tab-span-6"
                            >
                                {achievedCount} / {outcomes.length} achieved
                            </span>
                            <button
                                type="button"
                                onClick={() => toggleAll(outcomes, 'active')}
                                disabled={outcomes.length === 0}
                                className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
                                data-cy="learning-outcomes-tab-button-check-all"
                            >
                                Check all
                            </button>
                            <button
                                type="button"
                                onClick={() => toggleAll(outcomes, 'inactive')}
                                disabled={outcomes.length === 0}
                                className="text-xs font-medium text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
                                data-cy="learning-outcomes-tab-button-uncheck-all"
                            >
                                Uncheck all
                            </button>
                        </div>
                    </div>

                    {outcomes.length === 0 && (
                        <div
                            className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500"
                            data-cy="learning-outcomes-tab-div-no-learning-outcomes-configured-for-this"
                        >
                            No learning outcomes configured for this industry.
                        </div>
                    )}

                    <div
                        className="flex flex-col gap-2"
                        data-cy="learning-outcomes-tab-div-8"
                    >
                        {outcomes.map((o) => {
                            const checked = isAchieved(o);
                            const saving = savingId === o.id;
                            return (
                                <label
                                    key={o.id}
                                    className={cn(
                                        'flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors',
                                        checked
                                            ? 'border-brand-200 bg-brand-50'
                                            : 'border-neutral-200 hover:bg-neutral-50',
                                        saving && 'opacity-70',
                                    )}
                                    data-cy="learning-outcomes-tab-label-9"
                                >
                                    {saving ? (
                                        <span
                                            className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600"
                                            data-cy="learning-outcomes-tab-span-saving-spinner"
                                        />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggle(o)}
                                            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500"
                                            data-cy="learning-outcomes-tab-input-checkbox"
                                        />
                                    )}
                                    <span
                                        className={cn(
                                            'text-sm',
                                            checked
                                                ? 'text-brand-800'
                                                : 'text-ink',
                                        )}
                                        data-cy="learning-outcomes-tab-span-11"
                                    >
                                        {o.title}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </TraineesDetailLayout>
        </>
    );
}
