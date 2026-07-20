import { evaluationOverviewService } from '@/api-service-layer/admin/evaluation';
import { StatCard } from '@/components/StatCard';
import EvaluationPrimaryLayout from '@/layouts/evaluation/EvaluationPrimaryLayout';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, ListChecks, Star } from 'lucide-react';

function BarList({
    rows,
    labelKey,
    empty,
}: {
    rows: Array<{ answer_count: number } & Record<string, unknown>>;
    labelKey: string;
    empty: string;
}) {
    const max = Math.max(1, ...rows.map((r) => r.answer_count));

    if (rows.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-neutral-400">
                {empty}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5">
            {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 truncate text-xs text-neutral-600">
                        {String(row[labelKey] ?? '—')}
                    </span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-pill bg-neutral-100">
                        <div
                            className="h-full rounded-pill bg-brand-500"
                            style={{
                                width: `${Math.max(4, (row.answer_count / max) * 100)}%`,
                            }}
                        />
                    </div>
                    <span className="w-6 shrink-0 text-right text-xs font-medium text-ink">
                        {row.answer_count}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function EvaluationOverviewPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['evaluation-overview-metrics'],
        queryFn: evaluationOverviewService.metrics,
    });

    return (
        <EvaluationPrimaryLayout>
            <div className="flex flex-col gap-4" data-cy="overview-tab-div-1">
                <div
                    className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                    data-cy="overview-tab-div-3"
                >
                    <StatCard
                        label="Active questions"
                        value={
                            isLoading
                                ? '—'
                                : (data?.active_trainer_questions ?? 0) +
                                  (data?.active_seminar_questions ?? 0)
                        }
                        icon={ListChecks}
                        hint="Across trainer & seminar forms"
                        data-cy="overview-tab-stat-card-active-questions"
                    />
                    <StatCard
                        label="Total submissions"
                        value={
                            isLoading
                                ? '—'
                                : (data?.total_trainer_submissions ?? 0) +
                                  (data?.total_seminar_submissions ?? 0)
                        }
                        icon={ClipboardList}
                        hint="Submitted trainer + seminar evaluations"
                        data-cy="overview-tab-stat-card-total-responses"
                    />
                    <StatCard
                        label="Avg. trainer rating"
                        value={data?.average_trainer_score?.toFixed(1) ?? '—'}
                        icon={Star}
                        tone="accent"
                        hint="Out of 5 stars"
                        data-cy="overview-tab-stat-card-average-trainer-rating"
                    />
                    <StatCard
                        label="Avg. seminar rating"
                        value={data?.average_seminar_score?.toFixed(1) ?? '—'}
                        icon={Star}
                        tone="accent"
                        hint="Out of 5 stars"
                        data-cy="overview-tab-stat-card-average-seminar-rating"
                    />
                </div>

                <div
                    className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                    data-cy="overview-tab-div-8"
                >
                    <div className="rounded-lg border border-neutral-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-ink">
                            Trainer evaluation answers by batch
                        </h3>
                        <BarList
                            rows={data?.answers_by_batch ?? []}
                            labelKey="batch_code"
                            empty="No trainer evaluations submitted yet."
                        />
                    </div>
                    <div className="rounded-lg border border-neutral-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-ink">
                            Seminar evaluation answers by seminar
                        </h3>
                        <BarList
                            rows={data?.answers_by_seminar ?? []}
                            labelKey="topic"
                            empty="No seminar evaluations submitted yet."
                        />
                    </div>
                </div>
            </div>
        </EvaluationPrimaryLayout>
    );
}
