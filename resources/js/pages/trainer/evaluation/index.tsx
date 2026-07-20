import { StatCard } from '@/components/StatCard';
import DataTableCardField from '@/components/table/DataTableCardField';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import { trainerEvaluationsService } from '@/api-service-layer/trainer/evaluations';
import {
    trainerEvaluationColumns,
    type TrainerEvaluationMetrics,
    type TrainerEvaluationRow,
} from '@/types/modules/evaluation/trainer-evaluation';
import { ClipboardList, Star } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TrainerEvaluationOverviewPage() {
    const [metrics, setMetrics] = useState<TrainerEvaluationMetrics>({
        total_submissions: 0,
        average_score: null,
        answers_by_batch: [],
    });

    useEffect(() => {
        trainerEvaluationsService
            .metrics()
            .then(setMetrics)
            .catch(() => undefined);
    }, []);

    const maxBatch = Math.max(1, ...metrics.answers_by_batch.map((b) => b.answer_count));

    return (
        <TrainerLayout title="Evaluation Overview">
            <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <StatCard
                        label="Total submissions"
                        value={metrics.total_submissions}
                        icon={ClipboardList}
                        hint="Trainer evaluations from your batches"
                    />
                    <StatCard
                        label="Average rating"
                        value={metrics.average_score?.toFixed(1) ?? '—'}
                        icon={Star}
                        tone="accent"
                        hint="Out of 5 stars"
                    />
                    <StatCard
                        label="Batches with responses"
                        value={metrics.answers_by_batch.length}
                        tone="success"
                    />
                </div>

                <div className="rounded-lg border border-neutral-200 bg-white p-5">
                    <h3 className="mb-3 text-sm font-semibold text-ink">
                        Submissions by batch
                    </h3>
                    {metrics.answers_by_batch.length === 0 ? (
                        <div className="py-6 text-center text-sm text-neutral-400">
                            No trainer evaluations submitted yet.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {metrics.answers_by_batch.map((row) => (
                                <div
                                    key={row.batch_id}
                                    className="flex items-center gap-3"
                                >
                                    <span className="w-28 shrink-0 truncate text-xs text-neutral-600">
                                        {row.batch_code}
                                    </span>
                                    <div className="h-2.5 flex-1 overflow-hidden rounded-pill bg-neutral-100">
                                        <div
                                            className="h-full rounded-pill bg-brand-500"
                                            style={{
                                                width: `${Math.max(4, (row.answer_count / maxBatch) * 100)}%`,
                                            }}
                                        />
                                    </div>
                                    <span className="w-6 shrink-0 text-right text-xs font-medium text-ink">
                                        {row.answer_count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="mb-3 text-sm font-semibold text-ink">
                        Evaluation records
                    </h2>
                    <DataTableCardField<TrainerEvaluationRow>
                        apiUrl="/trainer/evaluation"
                        apiQueryKey="trainer-evaluation-records"
                        columns={trainerEvaluationColumns}
                        defaultSortBy="submitted_at"
                        defaultSortDir="desc"
                    />
                </div>
            </div>
        </TrainerLayout>
    );
}
