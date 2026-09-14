import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
    Archive,
    ClipboardList,
    Lock,
    ListChecks,
    Star,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { evaluationOverviewService } from '@/api-service-layer/admin/evaluation';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { StatCard } from '@/components/StatCard';
import type { ColumnDef } from '@/components/table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { useToast } from '@/components/Toast';
import EvaluationPrimaryLayout from '@/layouts/evaluation/EvaluationPrimaryLayout';
import { formatDate } from '@/lib/date';
import type { EvaluationRecordRow } from '@/types/modules/evaluation/evaluation';
import { EvaluationProgressCards } from './EvaluationProgressCards';
import { EvaluationRemindersPanel } from './EvaluationRemindersPanel';

function BarList({
    rows,
    labelKey,
    valueKey = 'answer_count',
    formatValue,
    empty,
}: {
    rows: Array<Record<string, unknown>>;
    labelKey: string;
    valueKey?: string;
    formatValue?: (row: Record<string, unknown>) => string;
    empty: string;
}) {
    const max = Math.max(1, ...rows.map((r) => Number(r[valueKey] ?? 0)));

    if (rows.length === 0) {
        return (
            <div className="py-6 text-center text-sm text-neutral-400">
                {empty}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5">
            {rows.map((row, i) => {
                const value = Number(row[valueKey] ?? 0);

                return (
                    <div key={i} className="flex items-center gap-3">
                        <span className="w-28 shrink-0 truncate text-xs text-neutral-600">
                            {String(row[labelKey] ?? '—')}
                        </span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-pill bg-neutral-100">
                            <div
                                className="h-full rounded-pill bg-brand-500"
                                style={{
                                    width: `${Math.max(4, (value / max) * 100)}%`,
                                }}
                            />
                        </div>
                        <span className="w-10 shrink-0 text-right text-xs font-medium text-ink">
                            {formatValue ? formatValue(row) : value}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

const recordColumns: ColumnDef<EvaluationRecordRow>[] = [
    { key: 'respondent', label: 'Respondent', searchable: true },
    { key: 'evaluated', label: 'Evaluated', searchable: true },
    {
        key: 'scope_detail',
        label: 'Scope',
        searchable: true,
        render: (v, row) => (
            <span className="inline-flex items-center gap-1.5">
                <span className="rounded-pill bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 uppercase">
                    {row.scope_label}
                </span>
                {String(v ?? '')}
            </span>
        ),
    },
    {
        key: 'score',
        label: 'Score',
        sortable: true,
        render: (v) => (v != null ? `${Number(v).toFixed(1)} ★` : '—'),
    },
    {
        key: 'submitted_at',
        label: 'Submitted',
        sortable: true,
        render: (v) => formatDate(v as string | null),
    },
    {
        key: 'archived_at',
        label: 'Status',
        filterable: true,
        type: 'select',
        typeData: [
            { value: '', label: 'All statuses' },
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
        ],
        exactFilters: true,
        render: (v) => (v ? 'Archived' : 'Active'),
    },
];

function RecordsTable() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [busyId, setBusyId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] =
        useState<EvaluationRecordRow | null>(null);

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['evaluation-records'] });

    async function archive(row: EvaluationRecordRow) {
        setBusyId(row.id);

        try {
            await evaluationOverviewService.archiveRecord(row.type, row.id);
            showToast('Record archived.', 'success');
            invalidate();
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : 'Failed to archive.',
                'error',
            );
        } finally {
            setBusyId(null);
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) {
            return;
        }

        const row = deleteTarget;
        setDeleteTarget(null);
        setBusyId(row.id);

        try {
            await evaluationOverviewService.deleteRecord(row.type, row.id);
            showToast('Record deleted.', 'success');
            invalidate();
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : 'Failed to delete.',
                'error',
            );
        } finally {
            setBusyId(null);
        }
    }

    return (
        <>
            <DataTableCardField<EvaluationRecordRow>
                apiUrl="/evaluation/overview/records"
                apiQueryKey="evaluation-records"
                columns={recordColumns}
                title="Evaluation records"
                description="Search, filter, archive, or delete individual evaluation submissions"
                defaultSortBy="submitted_at"
                defaultSortDir="desc"
                enableEdit={false}
                enableCreate={false}
                renderCard={(row) => (
                    <div className="grid grid-cols-[1.6fr_2.2fr_1.2fr_0.9fr_2.5rem] items-center gap-3 px-4 py-3">
                        <span className="truncate text-sm font-medium text-ink">
                            {row.respondent}
                        </span>
                        <span className="truncate text-sm text-neutral-600">
                            {row.evaluated}
                            <span className="ml-1.5 rounded-pill bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500 uppercase">
                                {row.scope_label}
                            </span>{' '}
                            {row.scope_detail}
                        </span>
                        <span className="text-sm text-neutral-600">
                            {row.score != null
                                ? `${Number(row.score).toFixed(1)} ★`
                                : '—'}
                        </span>
                        <span className="text-xs text-neutral-500">
                            {formatDate(row.submitted_at)}
                        </span>
                        <div className="flex items-center justify-end gap-1">
                            {row.locked ? (
                                <span title="Backs an issued certificate — cannot be modified">
                                    <Lock
                                        size={14}
                                        className="text-neutral-400"
                                    />
                                </span>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => archive(row)}
                                        disabled={busyId === row.id}
                                        title="Archive"
                                        className="rounded-md p-1.5 text-neutral-500 transition-colors hover:bg-neutral-100"
                                    >
                                        <Archive size={15} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteTarget(row)}
                                        disabled={busyId === row.id}
                                        title="Delete"
                                        className="rounded-md p-1.5 text-danger-600 transition-colors hover:bg-danger-50"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            />
            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => void confirmDelete()}
                title="Delete this evaluation submission?"
                description="This cannot be undone."
                confirmLabel="Delete"
                tone="danger"
            />
        </>
    );
}

export default function EvaluationOverviewPage() {
    const { data, isLoading } = useQuery({
        queryKey: ['evaluation-overview-metrics'],
        queryFn: evaluationOverviewService.metrics,
    });

    const pendingReminders = useQuery({
        queryKey: ['evaluation-reminder-candidates'],
        queryFn: evaluationOverviewService.reminders,
    });

    return (
        <EvaluationPrimaryLayout>
            <div className="flex flex-col gap-4" data-cy="overview-tab-div-1">
                <RecordsTable />

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
                    />
                    <StatCard
                        label="Total responses"
                        value={
                            isLoading
                                ? '—'
                                : (data?.total_trainer_submissions ?? 0) +
                                  (data?.total_seminar_submissions ?? 0)
                        }
                        icon={ClipboardList}
                        hint="Active evaluation records"
                    />
                    <StatCard
                        label="Average rating"
                        value={data?.average_trainer_score?.toFixed(1) ?? '—'}
                        icon={Star}
                        tone="accent"
                        hint="Out of 5 stars"
                    />
                    <StatCard
                        label="Pending reminders"
                        value={pendingReminders.data?.length ?? 0}
                        hint="Hours met, evaluation not yet submitted"
                    />
                </div>

                <div
                    className="grid grid-cols-1 gap-4 lg:grid-cols-2"
                    data-cy="overview-tab-div-8"
                >
                    <div className="rounded-lg border border-neutral-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-ink">
                            Answers received per batch & seminar
                        </h3>
                        <BarList
                            rows={[
                                ...(data?.answers_by_batch ?? []).map(
                                    (row) => ({
                                        ...row,
                                        label: `Batch ${row.batch_code}`,
                                    }),
                                ),
                                ...(data?.answers_by_seminar ?? []).map(
                                    (row) => ({
                                        ...row,
                                        label: row.topic as string,
                                    }),
                                ),
                            ].sort(
                                (a, b) =>
                                    Number(b.answer_count) -
                                    Number(a.answer_count),
                            )}
                            labelKey="label"
                            valueKey="answer_count"
                            empty="No evaluations submitted yet."
                        />
                    </div>
                    <div className="rounded-lg border border-neutral-200 bg-white p-5">
                        <h3 className="mb-3 text-sm font-semibold text-ink">
                            Average rating per batch
                        </h3>
                        <BarList
                            rows={data?.answers_by_batch ?? []}
                            labelKey="batch_code"
                            valueKey="average_score"
                            formatValue={(row) =>
                                row.average_score != null
                                    ? `${Number(row.average_score).toFixed(1)} ★`
                                    : '—'
                            }
                            empty="No trainer evaluations submitted yet."
                        />
                    </div>
                </div>

                <EvaluationProgressCards />

                <EvaluationRemindersPanel />
            </div>
        </EvaluationPrimaryLayout>
    );
}
