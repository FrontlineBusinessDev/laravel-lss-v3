import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FolderOpen, Play, Square } from 'lucide-react';
import { Modal } from '@/components/Modal';
import type { RowMenuAction } from '@/components/RowMenu';
import { RowMenu } from '@/components/RowMenu';
import { TextCell } from '@/components/settings';
import { TaskPriorityBadge } from '@/components/task/TaskPriorityBadge';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { useToast } from '@/hooks/use-toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import type { CardActions } from '@/types/reusable/card';
import type { ColumnDef } from '@/types/reusable/data-table';
import { loadLookupOptions } from '@/types/reusable/fields';
import { TASK_PRIORITY_OPTIONS, type ApiTask } from '@/types/task';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';
import TraineeTasksPrimaryLayout from '@/layouts/tasks/TraineeTasksPrimaryLayout';

const DUE_BUCKET_OPTIONS = [
    { label: 'Overdue', value: 'overdue' },
    { label: 'Due today', value: 'due_today' },
    { label: 'Due this week', value: 'due_this_week' },
];
const STATUS_STYLE: Record<string, string> = {
    open: 'bg-warning-50 text-warning-800',
    completed: 'bg-success-50 text-success-800',
    locked: 'bg-neutral-100 text-neutral-600',
};

const GRID = 'sm:grid-cols-[0.6fr_0.6fr_1.2fr_0.6fr_0.9fr_0.7fr_2.5rem]!';

const columns: ColumnDef<ApiTask>[] = [
    { key: 'task', label: 'Task', searchable: true },
    {
        key: 'priority',
        label: 'Priority',
        type: 'select',
        filterable: true,
        typeData: TASK_PRIORITY_OPTIONS,
    },
    {
        key: 'due_bucket',
        label: 'Due date',
        type: 'select',
        filterable: true,
        typeData: DUE_BUCKET_OPTIONS,
    },
    {
        key: 'batch_id',
        label: 'Category/Project',
        type: 'async-select',
        filterable: true,
        loadOptions: (q) => loadLookupOptions('/batches', q, 'batch_code'),
    },
    {
        key: 'date',
        label: 'Date',
        type: 'date-range',
        filterable: true,
        sortable: true,
    },
];

export default function TraineeTasksPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [viewTask, setViewTask] = useState<ApiTask | null>(null);

    const invalidateOpenTasks = () =>
        queryClient.invalidateQueries({ queryKey: [['trainee-tasks-open']] });

    async function runTaskAction(
        task: ApiTask,
        action: 'run' | 'stop' | 'complete',
    ) {
        try {
            await apiFetchJson(`/trainee/tasks/${task.id}/${action}`, {
                method: 'PATCH',
            });
            invalidateOpenTasks();
        } catch {
            toast({
                description: `Failed to ${action} "${task.task}".`,
                variant: 'error',
            });
        }
    }

    const renderRow = (row: ApiTask, _actions: CardActions) => {
        const menu: RowMenuAction[] = [
            {
                label: 'Open',
                icon: FolderOpen,
                onClick: () => setViewTask(row),
            },
            {
                label: 'Run',
                icon: Play,
                onClick: () => runTaskAction(row, 'run'),
                disabled: row.is_running || row.status !== 'open',
            },
            {
                label: 'Stop',
                icon: Square,
                onClick: () => runTaskAction(row, 'stop'),
                disabled: !row.is_running,
            },
            {
                label: 'Complete',
                icon: CheckCircle2,
                onClick: () => runTaskAction(row, 'complete'),
                disabled: row.status !== 'open',
            },
        ];

        return (
            <div
                className={cn(
                    'flex flex-col gap-1 px-4 py-3',
                    'sm:grid sm:items-center sm:gap-2',
                    GRID,
                )}
                data-cy="trainee-tasks-div-row"
            >
                <div
                    className="flex items-center gap-1.5"
                    data-cy="trainee-tasks-div-status"
                >
                    <span
                        className={cn(
                            'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                            STATUS_STYLE[row.status],
                        )}
                        data-cy="trainee-tasks-span-status"
                    >
                        {row.is_running ? 'Running' : 'Open'}
                    </span>
                </div>
                <TaskPriorityBadge
                    priority={row.priority}
                    data-cy="trainee-tasks-badge-priority"
                />
                <TextCell muted data-cy="trainee-tasks-text-cell-task">
                    {row.task}
                </TextCell>
                <TextCell muted data-cy="trainee-tasks-text-cell-time-goal">
                    {Number(row.time_goal)}h
                </TextCell>
                <TextCell muted data-cy="trainee-tasks-text-cell-batch">
                    {row.batch?.batch_code ?? '—'}
                </TextCell>
                <TextCell muted data-cy="trainee-tasks-text-cell-date">
                    {row.date?.slice(0, 10)}
                </TextCell>
                <div
                    className="flex items-center justify-end sm:justify-self-end"
                    data-cy="trainee-tasks-div-actions"
                >
                    <RowMenu actions={menu} data-cy="trainee-tasks-row-menu" />
                </div>
            </div>
        );
    };

    return (
        <TraineeTasksPrimaryLayout data-cy="trainee-tasks-layout">
            <DataTableCardField<ApiTask>
                apiUrl="/trainee/tasks"
                apiQueryKey="trainee-tasks-open"
                columns={columns}
                renderCard={renderRow}
                extraFilters={{ view: 'open' }}
                data-cy="trainee-tasks-data-table-card-field"
            />

            <Modal
                open={!!viewTask}
                onClose={() => setViewTask(null)}
                title={viewTask?.task ?? ''}
                maxWidth={440}
                data-cy="trainee-tasks-modal-view-task"
            >
                {viewTask && (
                    <div
                        className="flex flex-col gap-3 text-sm"
                        data-cy="trainee-tasks-div-view"
                    >
                        <div
                            className="flex items-center gap-2"
                            data-cy="trainee-tasks-div-view-badges"
                        >
                            <span
                                className={cn(
                                    'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                                    STATUS_STYLE[viewTask.status],
                                )}
                                data-cy="trainee-tasks-span-view-status"
                            >
                                {viewTask.is_running ? 'Running' : 'Open'}
                            </span>
                            <TaskPriorityBadge priority={viewTask.priority} />
                        </div>
                        <p
                            className="text-neutral-600"
                            data-cy="trainee-tasks-p-description"
                        >
                            {viewTask.description ?? 'No description.'}
                        </p>
                        <div
                            className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-neutral-50 p-3 text-xs"
                            data-cy="trainee-tasks-div-details"
                        >
                            <div>
                                <span className="text-neutral-500">
                                    Category/Project
                                </span>
                                <div className="font-medium text-ink">
                                    {viewTask.batch?.batch_code ?? '—'}
                                </div>
                            </div>
                            <div>
                                <span className="text-neutral-500">Date</span>
                                <div className="font-mono font-medium text-ink">
                                    {viewTask.date?.slice(0, 10)}
                                </div>
                            </div>
                            <div>
                                <span className="text-neutral-500">
                                    Time goal
                                </span>
                                <div className="font-mono font-medium text-ink">
                                    {Number(viewTask.time_goal)}h
                                </div>
                            </div>
                            <div>
                                <span className="text-neutral-500">
                                    Time spent
                                </span>
                                <div className="font-mono font-medium text-ink">
                                    {Number(viewTask.time_spent)}h
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </TraineeTasksPrimaryLayout>
    );
}
