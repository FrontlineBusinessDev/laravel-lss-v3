import { useTraineeOutcomeToggle } from '@/hooks/use-trainee-outcome-toggle';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import TrainerTraineeDetailLayout from '@/layouts/trainees/TrainerTraineeDetailLayout';
import { cn } from '@/lib/utils';
import type { TraineeDetail } from '@/types/modules/trainees/trainee-detail';

export default function LearningOutcomesTab({ trainee }: { trainee: TraineeDetail }) {
    const { isAchieved, toggle, savingId } = useTraineeOutcomeToggle(
        trainee.id,
        '/trainer/trainees',
    );
    const outcomes = trainee.outcomes ?? [];
    const achievedCount = outcomes.filter(isAchieved).length;

    return (
        <TrainerLayout title="Trainee">
            <TrainerTraineeDetailLayout trainee={trainee}>
                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-ink">
                                Learning outcomes
                            </h3>
                            <p className="text-xs text-neutral-500">
                                Outcomes associated with{' '}
                                {trainee.batch?.academic_industry?.name ?? 'this industry'}.
                                Select the ones achieved by the trainee.
                            </p>
                        </div>
                        <span className="text-xs text-neutral-500">
                            {achievedCount} / {outcomes.length} achieved
                        </span>
                    </div>

                    {outcomes.length === 0 && (
                        <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                            No learning outcomes configured for this industry.
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
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
                                >
                                    {saving ? (
                                        <span className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
                                    ) : (
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={() => toggle(o)}
                                            className="mt-0.5 h-4 w-4 shrink-0 accent-brand-500"
                                        />
                                    )}
                                    <span
                                        className={cn(
                                            'text-sm',
                                            checked ? 'text-brand-800' : 'text-ink',
                                        )}
                                    >
                                        {o.title}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            </TrainerTraineeDetailLayout>
        </TrainerLayout>
    );
}
