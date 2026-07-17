import { useState } from 'react';
import { FolderOpen } from 'lucide-react';
import { Modal } from '@/components/Modal';
import type { RowMenuAction } from '@/components/RowMenu';
import { RowMenu } from '@/components/RowMenu';
import { TextCell } from '@/components/settings';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import type { CardActions } from '@/types/reusable/card';
import type { ColumnDef } from '@/types/reusable/data-table';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { ApiTask } from '@/types/task';
import { cn } from '@/lib/utils';

const GRID = 'sm:grid-cols-[0.7fr_1.4fr_0.8fr_0.9fr_0.9fr_2.5rem]!';

const columns: ColumnDef<ApiTask>[] = [
    { key: 'task', label: 'Task', searchable: true },
    {
        key: 'batch_id',
        label: 'Category/Project',
        type: 'async-select',
        filterable: true,
        loadOptions: (q) => loadLookupOptions('/batches', q, 'batch_code'),
    },
    {
        key: 'completed_at',
        label: 'Completed on',
        type: 'date-range',
        filterable: true,
        sortable: true,
    },
];

function formatDate(value: string | null): string {
    return value ? value.slice(0, 10) : '—';
}

export default function DailyTaskSheetTab() {
    const [viewTask, setViewTask] = useState<ApiTask | null>(null);

    const renderRow = (row: ApiTask, _actions: CardActions) => {
        const menu: RowMenuAction[] = [
            { label: 'Open', icon: FolderOpen, onClick: () => setViewTask(row) },
        ];

        return (
            <div
                className={cn(
                    'flex flex-col gap-1 px-4 py-3',
                    'sm:grid sm:items-center sm:gap-2',
                    GRID,
                )}
                data-cy="daily-task-sheet-div-row"
            >
                <span
                    className="inline-flex w-fit items-center rounded-pill bg-success-50 px-2.5 py-0.5 text-xs font-medium text-success-800"
                    data-cy="daily-task-sheet-span-status"
                >
                    Completed
                </span>
                <TextCell muted data-cy="daily-task-sheet-text-cell-task">
                    {row.task}
                </TextCell>
                <TextCell muted data-cy="daily-task-sheet-text-cell-batch">
                    {row.batch?.batch_code ?? '—'}
                </TextCell>
                <TextCell muted data-cy="daily-task-sheet-text-cell-time-spent">
                    {Number(row.time_spent)}h
                </TextCell>
                <TextCell muted data-cy="daily-task-sheet-text-cell-completed-at">
                    {formatDate(row.completed_at)}
                </TextCell>
                <div
                    className="flex items-center justify-end sm:justify-self-end"
                    data-cy="daily-task-sheet-div-actions"
                >
                    <RowMenu actions={menu} data-cy="daily-task-sheet-row-menu" />
                </div>
            </div>
        );
    };

    return (
        <>
            <DataTableCardField<ApiTask>
                apiUrl="/trainee/tasks"
                apiQueryKey="trainee-tasks-completed"
                columns={columns}
                renderCard={renderRow}
                extraFilters={{ view: 'completed' }}
                defaultSortBy="completed_at"
                defaultSortDir="desc"
                data-cy="daily-task-sheet-data-table-card-field"
            />

            <Modal
                open={!!viewTask}
                onClose={() => setViewTask(null)}
                title={viewTask?.task ?? ''}
                maxWidth={440}
                data-cy="daily-task-sheet-modal-view-task"
            >
                {viewTask && (
                    <div className="flex flex-col gap-3 text-sm" data-cy="daily-task-sheet-div-view">
                        <p className="text-neutral-600" data-cy="daily-task-sheet-p-description">
                            {viewTask.description ?? 'No description.'}
                        </p>
                        <div
                            className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-neutral-50 p-3 text-xs"
                            data-cy="daily-task-sheet-div-details"
                        >
                            <div>
                                <span className="text-neutral-500">Category/Project</span>
                                <div className="font-medium text-ink">
                                    {viewTask.batch?.batch_code ?? '—'}
                                </div>
                            </div>
                            <div>
                                <span className="text-neutral-500">Completed on</span>
                                <div className="font-mono font-medium text-ink">
                                    {formatDate(viewTask.completed_at)}
                                </div>
                            </div>
                            <div>
                                <span className="text-neutral-500">Time goal</span>
                                <div className="font-mono font-medium text-ink">
                                    {Number(viewTask.time_goal)}h
                                </div>
                            </div>
                            <div>
                                <span className="text-neutral-500">Time spent</span>
                                <div className="font-mono font-medium text-ink">
                                    {Number(viewTask.time_spent)}h
                                </div>
                            </div>
                        </div>
                        {viewTask.remarks && (
                            <div data-cy="daily-task-sheet-div-remarks">
                                <span className="mb-1 block text-xs font-medium text-neutral-600">
                                    Remarks
                                </span>
                                <p className="text-neutral-600">{viewTask.remarks}</p>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}
