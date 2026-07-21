import { evaluationAccessOverrideService } from '@/api-service-layer/admin/evaluation';
import { useToast } from '@/components/Toast';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileWarning, Search, ShieldAlert } from 'lucide-react';
import { useState } from 'react';

export function AccessOverridePanel() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [query, setQuery] = useState('');
    const [pendingId, setPendingId] = useState<number | null>(null);

    const { data: candidates = [], isLoading } = useQuery({
        queryKey: ['evaluation-override-candidates', query],
        queryFn: () => evaluationAccessOverrideService.candidates(query),
    });

    async function toggle(traineeId: number, allowed: boolean, name: string) {
        setPendingId(traineeId);
        try {
            await evaluationAccessOverrideService.toggle(traineeId, allowed);
            await queryClient.invalidateQueries({
                queryKey: ['evaluation-override-candidates'],
            });
            showToast(
                allowed
                    ? `${name} can now access the evaluation form despite incomplete documents.`
                    : `Evaluation access override removed for ${name}.`,
                'success',
            );
        } catch {
            showToast('Failed to update the override. Try again.', 'error');
        } finally {
            setPendingId(null);
        }
    }

    return (
        <div
            className="rounded-lg border border-neutral-200 bg-white"
            data-cy="access-override-panel-div-1"
        >
            <div
                className="flex items-start gap-2 border-b border-neutral-200 p-4"
                data-cy="access-override-panel-div-2"
            >
                <ShieldAlert
                    size={15}
                    className="mt-0.5 shrink-0 text-warning-600"
                    data-cy="access-override-panel-shield-alert-3"
                />
                <div data-cy="access-override-panel-div-4">
                    <h2
                        className="text-sm font-semibold text-ink"
                        data-cy="access-override-panel-h2-evaluation-access-overrides"
                    >
                        Evaluation access overrides
                    </h2>
                    <p
                        className="text-xs text-neutral-500"
                        data-cy="access-override-panel-p-trainees-with-incomplete-documents-are-normally"
                    >
                        Trainees with incomplete documents are normally
                        blocked from the trainer-evaluation form. Grant an
                        override below to let a specific trainee proceed
                        anyway.
                    </p>
                </div>
            </div>

            <div
                className="border-b border-neutral-100 p-3"
                data-cy="access-override-panel-div-7"
            >
                <div
                    className="relative w-full sm:max-w-xs"
                    data-cy="access-override-panel-div-8"
                >
                    <Search
                        size={14}
                        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-neutral-400"
                        data-cy="access-override-panel-search-9"
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search trainee or batch..."
                        className="h-9 w-full rounded-md border border-neutral-200 pr-2.5 pl-8 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                        data-cy="access-override-panel-input-search-trainee-or-batch"
                    />
                </div>
            </div>

            <div
                className="divide-y divide-neutral-100"
                data-cy="access-override-panel-div-11"
            >
                {isLoading && (
                    <div className="px-4 py-8 text-center text-xs text-neutral-400">
                        Loading...
                    </div>
                )}
                {!isLoading &&
                    candidates.map((t) => {
                        const allowed = t.evaluation_access_override;
                        return (
                            <div
                                key={t.id}
                                className="flex items-center justify-between gap-3 px-4 py-3"
                                data-cy="access-override-panel-div-12"
                            >
                                <div
                                    className="min-w-0"
                                    data-cy="access-override-panel-div-13"
                                >
                                    <p
                                        className="truncate text-sm font-medium text-ink"
                                        data-cy="access-override-panel-p-14"
                                    >
                                        {t.name}
                                    </p>
                                    <p
                                        className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-neutral-500"
                                        data-cy="access-override-panel-p-missing"
                                    >
                                        <FileWarning
                                            size={11}
                                            className="text-warning-600"
                                            data-cy="access-override-panel-file-warning-16"
                                        />
                                        {t.batch_code ?? 'Unassigned batch'}{' '}
                                        &middot; missing{' '}
                                        {t.missing_documents.length} document
                                        {t.missing_documents.length === 1
                                            ? ''
                                            : 's'}
                                    </p>
                                </div>
                                <button
                                    role="switch"
                                    aria-checked={allowed}
                                    disabled={pendingId === t.id}
                                    onClick={() =>
                                        toggle(t.id, !allowed, t.name)
                                    }
                                    className={cn(
                                        'relative h-6 w-11 shrink-0 rounded-pill transition-colors disabled:opacity-50',
                                        allowed
                                            ? 'bg-brand-500'
                                            : 'bg-neutral-200',
                                    )}
                                    data-cy="access-override-panel-button-toggle"
                                >
                                    <span
                                        className={cn(
                                            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform',
                                            allowed
                                                ? 'translate-x-[22px]'
                                                : 'translate-x-0.5',
                                        )}
                                        data-cy="access-override-panel-span-18"
                                    />
                                </button>
                            </div>
                        );
                    })}
                {!isLoading && candidates.length === 0 && (
                    <div
                        className="px-4 py-8 text-center text-xs text-neutral-400"
                        data-cy="access-override-panel-div-no-trainees-with-incomplete-documents-match"
                    >
                        No trainees with incomplete documents match your
                        search.
                    </div>
                )}
            </div>
        </div>
    );
}
