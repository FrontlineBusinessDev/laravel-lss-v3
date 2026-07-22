import { useCallback, useEffect, useState } from 'react';
import { Printer, Info } from 'lucide-react';
import { Button } from '@/components/Button';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import TasksPrimaryLayout from '@/layouts/tasks/TasksPrimaryLayout';
import { DailyTaskSheetPrint } from '@/pages/developer/tasks/DailyTaskSheetPrint';
import type { FieldOption } from '@/types/reusable/fields';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { ColumnDef } from '@/types/reusable/data-table';
import type { TaskRecord } from '@/types/modules/tasks/daily-task';

interface ApiDailyTaskRow {
    id: number;
    batch_code: string | null;
    task: string;
    description: string | null;
    time_goal: number;
    time_spent: number;
    remarks: string | null;
    trainee: string;
    trainer: string;
    date: string;
    on_leave: boolean;
    leave_reason: string | null;
    [key: string]: unknown;
}
interface PersonOption {
    id: number;
    first_name: string;
    last_name: string;
}
function personLabel(p: PersonOption): string {
    return `${p.first_name} ${p.last_name}`.trim();
}
function toRecord(r: ApiDailyTaskRow): TaskRecord {
    return {
        id: String(r.id),
        batchNo: r.batch_code ?? '',
        task: r.task,
        description: r.description ?? '',
        timeGoal: Number(r.time_goal),
        timeSpent: Number(r.time_spent),
        trainee: r.trainee,
        trainer: r.trainer,
        date: r.date?.slice(0, 10),
        status: 'completed',
        onLeave: r.on_leave,
        leaveReason: r.leave_reason ?? undefined,
        remarks: r.remarks ?? undefined,
    };
}

async function loadTraineeOptions(q: string): Promise<FieldOption[]> {
    const res = await apiFetchJson<PersonOption[]>(
        `/trainees/lookup?status=active&per_page=50&q=${encodeURIComponent(q)}`,
    );
    return (res.data ?? []).map((p) => ({
        value: String(p.id),
        label: personLabel(p),
    }));
}
async function loadTrainerOptions(q: string): Promise<FieldOption[]> {
    const res = await apiFetchJson<PersonOption[]>('/tasks/trainers');
    const needle = q.trim().toLowerCase();
    return (res.data ?? [])
        .filter((p) => !needle || personLabel(p).toLowerCase().includes(needle))
        .map((p) => ({ value: String(p.id), label: personLabel(p) }));
}

const GRID =
    'sm:grid sm:grid-cols-[0.8fr_1.2fr_1.6fr_0.7fr_0.9fr_1.4fr_1fr_1fr_0.8fr] sm:items-center sm:gap-3';

const columns: ColumnDef<ApiDailyTaskRow>[] = [
    { key: 'batch_code', label: 'Batch' },
    { key: 'task', label: 'Task' },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'time_goal', label: 'Time goal', sortable: false },
    { key: 'time_spent', label: 'Time spent', sortable: false },
    { key: 'remarks', label: 'Remarks', sortable: false },
    { key: 'trainee', label: 'Trainee', sortable: false },
    { key: 'trainer', label: 'Trainer', sortable: false },
    {
        key: 'date',
        label: 'Date',
        filterable: true,
        sortable: true,
        type: 'date-range',
    },
    {
        key: 'batch_id',
        label: 'Batch',
        filterable: true,
        sortable: false,
        type: 'async-select',
        loadOptions: (q) => loadLookupOptions('/batches', q, 'batch_code'),
    },
    {
        key: 'trainee_id',
        label: 'Trainee',
        filterable: true,
        sortable: false,
        type: 'async-multi-select',
        loadOptions: loadTraineeOptions,
    },
    {
        key: 'trainer_id',
        label: 'Trainer',
        filterable: true,
        sortable: false,
        type: 'async-multi-select',
        loadOptions: loadTrainerOptions,
    },
];

const listHeader = (
    <div
        className={cn('hidden bg-neutral-50 px-4 py-2.5 text-left text-xs font-medium text-neutral-500', GRID)}
        data-cy="daily-task-list-header"
    >
        <span>Batch</span>
        <span>Task</span>
        <span>Description</span>
        <span>Time goal</span>
        <span>Time spent</span>
        <span>Remarks</span>
        <span>Trainee</span>
        <span>Trainer</span>
        <span>Date</span>
    </div>
);

export default function DailyTaskSheetPage() {
    const { showToast } = useToast();
    const [reportRows, setReportRows] = useState<TaskRecord[]>([]);
    const [refreshTable, setRefreshTable] = useState<() => void>(() => () => {});
    const [activeFilters, setActiveFilters] = useState<{
        filters: Record<string, string | string[]>;
        search: string;
    }>({ filters: {}, search: '' });

    const loadReport = useCallback(
        async (filters: Record<string, string | string[]>) => {
            try {
                const params = new URLSearchParams();
                const dateFrom = filters.date_from;
                const dateTo = filters.date_to;
                if (typeof dateFrom === 'string' && dateFrom) params.set('date_from', dateFrom);
                if (typeof dateTo === 'string' && dateTo) params.set('date_to', dateTo);
                const batchId = filters.batch_id;
                if (typeof batchId === 'string' && batchId) params.set('batch_id', batchId);
                (Array.isArray(filters.trainee_id) ? filters.trainee_id : []).forEach((id) =>
                    params.append('trainee_ids[]', id),
                );
                (Array.isArray(filters.trainer_id) ? filters.trainer_id : []).forEach((id) =>
                    params.append('trainer_ids[]', id),
                );

                const res = await apiFetchJson<ApiDailyTaskRow[]>(
                    `/tasks/daily-task/list?${params.toString()}`,
                );
                setReportRows((res.data ?? []).map(toRecord));
            } catch {
                showToast('Failed to load the daily task sheet.', 'error');
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        loadReport(activeFilters.filters);
    }, [activeFilters, loadReport]);

    async function updateTimeSpent(id: number, value: number) {
        try {
            await apiFetchJson(`/tasks/${id}/time-spent`, {
                method: 'PATCH',
                body: JSON.stringify({ time_spent: value }),
            });
            refreshTable();
            loadReport(activeFilters.filters);
        } catch {
            showToast('Failed to update time spent.', 'error');
        }
    }
    async function updateRemarks(id: number, value: string) {
        try {
            await apiFetchJson(`/tasks/${id}/remarks`, {
                method: 'PATCH',
                body: JSON.stringify({ remarks: value }),
            });
            showToast('Remarks saved.', 'success');
            refreshTable();
            loadReport(activeFilters.filters);
        } catch {
            showToast('Failed to save remarks.', 'error');
        }
    }

    function renderRow(row: ApiDailyTaskRow) {
        return (
            <div className={cn('px-4 py-3 text-sm', GRID)} data-cy="daily-task-row">
                <span className="font-mono text-xs text-neutral-600">{row.batch_code}</span>
                <span className="font-medium text-ink">{row.task}</span>
                <span className="max-w-[200px] truncate text-xs text-neutral-500" title={row.description ?? ''}>
                    {row.description}
                </span>
                <span className="font-mono text-xs text-neutral-600">{row.time_goal}h</span>
                <span>
                    {row.on_leave ? (
                        <span className="font-mono text-xs text-neutral-400">0h</span>
                    ) : (
                        <input
                            type="number"
                            min={0}
                            defaultValue={row.time_spent}
                            onBlur={(e) => updateTimeSpent(row.id, Number(e.target.value))}
                            className="h-8 w-16 rounded-md border border-neutral-200 px-2 font-mono text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                            data-cy="daily-task-input-time-spent"
                        />
                    )}
                </span>
                <span className="max-w-[220px]">
                    {row.on_leave ? (
                        <span
                            className="inline-flex items-center rounded-pill bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600"
                            title={row.leave_reason ?? ''}
                        >
                            {row.leave_reason}
                        </span>
                    ) : (
                        <input
                            type="text"
                            defaultValue={row.remarks ?? ''}
                            placeholder="Add remarks..."
                            onBlur={(e) => {
                                if (e.target.value.trim() !== (row.remarks ?? '').trim()) {
                                    updateRemarks(row.id, e.target.value);
                                }
                            }}
                            className="h-8 w-full min-w-[140px] rounded-md border border-transparent px-2 text-xs text-neutral-600 transition-colors hover:border-neutral-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                            data-cy="daily-task-input-remarks"
                        />
                    )}
                </span>
                <span className="text-neutral-600">{row.trainee}</span>
                <span className="text-neutral-600">{row.trainer}</span>
                <span className="font-mono text-xs text-neutral-600">{row.date?.slice(0, 10)}</span>
            </div>
        );
    }

    const totalTimeSpent = reportRows.reduce((sum, t) => sum + t.timeSpent, 0);
    const dateRangeLabel =
        activeFilters.filters.date_from || activeFilters.filters.date_to
            ? `${activeFilters.filters.date_from || 'Start'} – ${activeFilters.filters.date_to || 'Present'}`
            : 'All dates';
    const printGeneratedAt = new Date().toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });

    return (
        <TasksPrimaryLayout data-cy="daily-task-tasks-primary-layout-1">
            <div data-cy="daily-task-div-1">
                <div
                    className="no-print mb-3 flex items-start gap-1.5 rounded-lg border border-neutral-200 bg-white p-3 text-[11px] text-neutral-400"
                    data-cy="daily-task-div-showing-completed-tasks-only-open-or"
                >
                    <Info size={12} className="mt-0.5 shrink-0" />
                    {'Showing completed tasks only. Open or locked tasks aren’t part of the Daily Task Sheet report.'}
                </div>

                <div className="no-print mb-3 flex items-center justify-between" data-cy="daily-task-div-80">
                    <span className="text-xs text-neutral-500" data-cy="daily-task-span-record">
                        {`${reportRows.length} record${reportRows.length === 1 ? '' : 's'}`}
                    </span>
                    <Button
                        variant="secondary"
                        size="sm"
                        icon={Printer}
                        onClick={() => window.print()}
                        disabled={reportRows.length === 0}
                        data-cy="daily-task-button-82"
                    >
                        Print daily task sheet
                    </Button>
                </div>

                <div className="no-print">
                    <DataTableCardField<ApiDailyTaskRow>
                        apiUrl="/tasks/daily-task"
                        apiQueryKey="daily-task-sheet"
                        columns={columns}
                        defaultSortBy="date"
                        listHeader={listHeader}
                        renderCard={(row) => renderRow(row)}
                        onRefreshRef={(fn) => setRefreshTable(() => fn)}
                        onFiltersChange={(filters, search) => setActiveFilters({ filters, search })}
                    />
                </div>

                <div className="no-print mt-3 flex justify-end text-xs text-neutral-500" data-cy="daily-task-div-total-time-spent-filtered">
                    Total time spent (filtered):{' '}
                    <span className="ml-1 font-mono font-semibold text-ink">{totalTimeSpent}h</span>
                </div>

                <DailyTaskSheetPrint
                    rows={reportRows}
                    generatedAt={printGeneratedAt}
                    dateRangeLabel={dateRangeLabel}
                    data-cy="daily-task-daily-task-sheet-print-116"
                />
            </div>
        </TasksPrimaryLayout>
    );
}
