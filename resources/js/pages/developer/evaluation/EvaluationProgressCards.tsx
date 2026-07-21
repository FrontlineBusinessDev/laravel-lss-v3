import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { evaluationOverviewService } from '@/api-service-layer/admin/evaluation';
import { cn } from '@/lib/utils';

type Scope = 'batch' | 'seminar';

/** "Answers received per batch & seminar" — response-ratio cards, toggled between Batch and Seminar scope. */
export function EvaluationProgressCards() {
    const [scope, setScope] = useState<Scope>('batch');

    const { data: batches = [], isLoading: loadingBatches } = useQuery({
        queryKey: ['evaluation-batch-progress'],
        queryFn: evaluationOverviewService.batchProgress,
        enabled: scope === 'batch',
    });

    const { data: seminars = [], isLoading: loadingSeminars } = useQuery({
        queryKey: ['evaluation-seminar-progress'],
        queryFn: evaluationOverviewService.seminarProgress,
        enabled: scope === 'seminar',
    });

    const isLoading = scope === 'batch' ? loadingBatches : loadingSeminars;
    const rows =
        scope === 'batch'
            ? batches.map((b) => ({
                  id: b.batch_id,
                  title: b.batch_code,
                  subtitle: null as string | null,
                  status: b.status,
                  submitted: b.submitted,
                  expected: b.expected,
              }))
            : seminars.map((s) => ({
                  id: s.seminar_id,
                  title: s.topic,
                  subtitle: null,
                  status: s.status,
                  submitted: s.submitted,
                  expected: s.expected,
              }));

    return (
        <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <div className="mb-1 flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-sm font-semibold text-ink">
                        Answers received per batch & seminar
                    </h3>
                    <p className="text-xs text-neutral-500">
                        Click a batch to see every individual who answered.
                    </p>
                </div>
                <div className="flex rounded-md border border-neutral-200 p-0.5">
                    <button
                        type="button"
                        onClick={() => setScope('batch')}
                        className={cn(
                            'rounded px-3 py-1 text-xs font-medium transition-colors',
                            scope === 'batch'
                                ? 'bg-brand-500 text-white'
                                : 'text-neutral-500 hover:text-neutral-700',
                        )}
                    >
                        Batch
                    </button>
                    <button
                        type="button"
                        onClick={() => setScope('seminar')}
                        className={cn(
                            'rounded px-3 py-1 text-xs font-medium transition-colors',
                            scope === 'seminar'
                                ? 'bg-brand-500 text-white'
                                : 'text-neutral-500 hover:text-neutral-700',
                        )}
                    >
                        Seminar
                    </button>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading && (
                    <div className="col-span-full py-6 text-center text-sm text-neutral-400">
                        Loading...
                    </div>
                )}
                {!isLoading && rows.length === 0 && (
                    <div className="col-span-full py-6 text-center text-sm text-neutral-400">
                        No {scope === 'batch' ? 'batches' : 'seminars'} found.
                    </div>
                )}
                {!isLoading &&
                    rows.map((row) => {
                        const pct =
                            row.expected > 0
                                ? Math.min(100, (row.submitted / row.expected) * 100)
                                : 0;
                        return (
                            <div
                                key={row.id}
                                className="rounded-md border border-neutral-200 p-3"
                            >
                                <div className="mb-1 flex items-center justify-between gap-2">
                                    <span className="truncate text-sm font-medium text-ink">
                                        {row.title}
                                    </span>
                                    <span className="rounded-pill bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600 capitalize">
                                        {row.status}
                                    </span>
                                </div>
                                <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500">
                                    <span>Responses</span>
                                    <span className="font-medium text-ink">
                                        {row.submitted} / {row.expected}
                                    </span>
                                </div>
                                <div className="h-1.5 overflow-hidden rounded-pill bg-neutral-100">
                                    <div
                                        className="h-full rounded-pill bg-brand-500"
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
            </div>
        </div>
    );
}
