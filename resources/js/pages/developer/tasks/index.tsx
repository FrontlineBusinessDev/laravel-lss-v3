import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Lock,
    CheckCircle2,
    FolderOpen,
    Pencil,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type { RowMenuAction } from '@/components/RowMenu';
import { RowMenu } from '@/components/RowMenu';
import { SettingsListHeader, TextCell } from '@/components/settings';
import { TaskPriorityBadge } from '@/components/task/TaskPriorityBadge';
import type { CardActions } from '@/types/reusable/card';
import type { ColumnDef } from '@/types/reusable/data-table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { useToast } from '@/hooks/use-toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { loadLookupOptions, type FieldOption } from '@/types/reusable/fields';
import { cn } from '@/lib/utils';
import TasksPrimaryLayout from '@/layouts/tasks/TasksPrimaryLayout';
import {
    type ApiTask,
    TASK_PRIORITY_OPTIONS,
    TASK_STATUS_FILTER_OPTIONS,
} from '@/types/task';
import {
    AddTaskModal,
    type TaskSavePayload,
} from '@/pages/developer/tasks/AddTaskModal';

const PERMISSION = 'manage tasks';

const STATUS_STYLE: Record<string, string> = {
    open: 'bg-warning-50 text-warning-800',
    completed: 'bg-success-50 text-success-800',
    locked: 'bg-neutral-100 text-neutral-600',
};
const STATUS_LABEL: Record<string, string> = {
    open: 'Open',
    completed: 'Completed',
    locked: 'Locked',
};
function personName(
    p: {
        first_name: string;
        last_name: string;
    } | null,
): string {
    return p ? `${p.first_name} ${p.last_name}`.trim() : '—';
}

async function loadTrainerFilterOptions(query: string): Promise<FieldOption[]> {
    const res =
        await apiFetchJson<
            { id: number; first_name: string; last_name: string }[]
        >('/tasks/trainers');
    const options = (res.data ?? []).map((p) => ({
        value: String(p.id),
        label: personName(p),
    }));
    const q = query.trim().toLowerCase();
    return q
        ? options.filter((o) => o.label.toLowerCase().includes(q))
        : options;
}
async function loadTraineeFilterOptions(query: string): Promise<FieldOption[]> {
    const res = await apiFetchJson<
        { id: number; first_name: string; last_name: string }[]
    >(
        `/trainees/lookup?status=active&per_page=50&q=${encodeURIComponent(query)}`,
    );
    return (res.data ?? []).map((p) => ({
        value: String(p.id),
        label: personName(p),
    }));
}

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
        key: 'batch_id',
        label: 'Batch',
        type: 'async-multi-select',
        filterable: true,
        loadOptions: (q) => loadLookupOptions('/batches', q, 'batch_code'),
    },
    {
        key: 'trainee_id',
        label: 'Trainee',
        type: 'async-multi-select',
        filterable: true,
        loadOptions: loadTraineeFilterOptions,
    },
    {
        key: 'trainer_id',
        label: 'Trainer',
        type: 'async-multi-select',
        filterable: true,
        loadOptions: loadTrainerFilterOptions,
    },
    {
        key: 'date',
        label: 'Date',
        type: 'date-range',
        filterable: true,
        sortable: true,
    },
    { key: 'created_at', label: 'Date created', sortable: true },
];

const customGRID =
    'sm:grid-cols-[0.7fr_0.7fr_0.7fr_1fr_1.2fr_0.6fr_0.9fr_0.9fr_0.7fr_2.5rem]!';
const listHeader = (
    <SettingsListHeader
        grid={customGRID}
        labels={[
            'Status',
            'Priority',
            'Batch',
            'Task',
            'Description',
            'Time goal',
            'Trainee',
            'Trainer',
            'Date',
        ]}
        data-cy="index-settings-list-header-1"
    />
);

export default function TasksPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<ApiTask | null>(null);
    const [viewTask, setViewTask] = useState<ApiTask | null>(null);
    const [viewRemarks, setViewRemarks] = useState('');

    const invalidateTasks = () =>
        queryClient.invalidateQueries({ queryKey: [['tasks']] });

    async function handleSave(payload: TaskSavePayload) {
        try {
            if (payload.mode === 'edit') {
                const { id, mode: _mode, ...body } = payload;
                await apiFetchJson(`/tasks/${id}`, {
                    method: 'POST',
                    body: JSON.stringify(body),
                });
                toast({
                    description: `"${payload.task}" updated.`,
                    variant: 'success',
                });
            } else {
                const { mode: _mode, ...body } = payload;
                await apiFetchJson('/tasks', {
                    method: 'POST',
                    body: JSON.stringify(body),
                });
                toast({
                    description: `Task "${payload.task}" assigned.`,
                    variant: 'success',
                });
            }
            setAddModalOpen(false);
            setEditingTask(null);
            invalidateTasks();
        } catch {
            toast({ description: 'Failed to save task.', variant: 'error' });
        }
    }
    async function runComplete(task: ApiTask) {
        try {
            await apiFetchJson(`/tasks/${task.id}/complete`, {
                method: 'PATCH',
            });
            toast({
                description: `"${task.task}" marked as complete.`,
                variant: 'success',
            });
            invalidateTasks();
        } catch {
            toast({
                description: 'Failed to complete task.',
                variant: 'error',
            });
        }
    }
    async function runLock(task: ApiTask) {
        try {
            await apiFetchJson(`/tasks/${task.id}/lock`, { method: 'PATCH' });
            toast({
                description: `"${task.task}" locked.`,
                variant: 'success',
            });
            invalidateTasks();
        } catch {
            toast({ description: 'Failed to lock task.', variant: 'error' });
        }
    }
    async function saveRemarks() {
        if (!viewTask) return;
        try {
            await apiFetchJson(`/tasks/${viewTask.id}/remarks`, {
                method: 'PATCH',
                body: JSON.stringify({ remarks: viewRemarks }),
            });
            toast({
                description: `Remarks saved for ${personName(viewTask.trainee)}'s "${viewTask.task}".`,
                variant: 'success',
            });
            setViewTask(null);
            invalidateTasks();
        } catch {
            toast({
                description:
                    'This task is locked and remarks can no longer be edited.',
                variant: 'error',
            });
        }
    }

    const renderRow = (row: ApiTask, actions: CardActions) => {
        const menu: RowMenuAction[] = [
            {
                label: 'Open',
                icon: FolderOpen,
                onClick: () => {
                    setViewTask(row);
                    setViewRemarks(row.remarks ?? '');
                },
            },
            {
                label: 'Edit',
                icon: Pencil,
                onClick: actions.onEdit,
            },
            {
                label: 'Complete',
                icon: CheckCircle2,
                onClick: () => runComplete(row),
                disabled: row.status === 'completed' || row.status === 'locked',
            },
            {
                label: 'Lock',
                icon: Lock,
                onClick: () => runLock(row),
                disabled: row.status === 'locked',
            },
            {
                label: 'Delete',
                icon: Trash2,
                danger: true,
                onClick: () => void actions.onDelete(),
            },
        ];

        return (
            <div
                className={cn(
                    'flex flex-col gap-1 px-4 py-3',
                    'sm:grid sm:items-center sm:gap-2',
                    customGRID,
                )}
                data-cy="index-div-row"
            >
                <div data-cy="index-div-status">
                    <span
                        className={cn(
                            'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                            STATUS_STYLE[row.status],
                        )}
                        data-cy="index-span-status"
                    >
                        {STATUS_LABEL[row.status]}
                    </span>
                </div>
                <div data-cy="index-div-priority">
                    <TaskPriorityBadge priority={row.priority} data-cy="index-badge-priority" />
                </div>
                <TextCell muted data-cy="index-text-cell-batch">
                    {row.batch?.batch_code ?? '—'}
                </TextCell>
                <TextCell muted data-cy="index-text-cell-task">
                    {row.task}
                </TextCell>
                <TextCell muted data-cy="index-text-cell-description">
                    {row.description ?? '—'}
                </TextCell>
                <TextCell muted data-cy="index-text-cell-time-goal">
                    {Number(row.time_goal)}h
                </TextCell>
                <TextCell muted data-cy="index-text-cell-trainee">
                    {personName(row.trainee)}
                </TextCell>
                <TextCell muted data-cy="index-text-cell-trainer">
                    {personName(row.trainer)}
                </TextCell>
                <TextCell muted data-cy="index-text-cell-date">
                    {row.date?.slice(0, 10)}
                </TextCell>
                <div
                    className="flex items-center justify-end sm:justify-self-end"
                    data-cy="index-div-actions"
                >
                    <RowMenu actions={menu} data-cy="index-row-menu" />
                </div>
            </div>
        );
    };

    return (
        <TasksPrimaryLayout data-cy="index-tasks-primary-layout-1">
            <div data-cy="index-div-1">
                <div
                    className="mb-4 flex items-center justify-between"
                    data-cy="index-div-2"
                >
                    <div data-cy="index-div-heading">
                        {/* <h2
                            className="text-sm font-semibold text-ink"
                            data-cy="index-h2-task-management"
                        >
                            Task management
                        </h2>
                        <p
                            className="text-xs text-neutral-500"
                            data-cy="index-p-editable-any-status"
                        >
                            Tasks can be edited at any time, regardless of
                            status.
                        </p> */}
                    </div>
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => {
                            setEditingTask(null);
                            setAddModalOpen(true);
                        }}
                        data-cy="index-button-set-add-modal-open"
                    >
                        Add task
                    </Button>
                </div>

                <DataTableCardField<ApiTask>
                    apiUrl="/tasks"
                    apiQueryKey="tasks"
                    columns={columns}
                    listHeader={listHeader}
                    renderCard={renderRow}
                    enableStatusFilter
                    statusFilterOptions={TASK_STATUS_FILTER_OPTIONS}
                    editPermission={PERMISSION}
                    deletePermission={PERMISSION}
                    onEditRow={(row) => {
                        setEditingTask(row);
                        setAddModalOpen(true);
                    }}
                    data-cy="index-data-table-card-field-1"
                />

                {/* Add / edit task modal */}
                <AddTaskModal
                    open={addModalOpen}
                    editingTask={
                        editingTask
                            ? {
                                  id: editingTask.id,
                                  date: editingTask.date,
                                  task: editingTask.task,
                                  description: editingTask.description,
                                  time_goal: editingTask.time_goal,
                                  priority: editingTask.priority,
                                  batch: editingTask.batch,
                                  trainee: editingTask.trainee,
                                  trainer: editingTask.trainer,
                              }
                            : null
                    }
                    onClose={() => {
                        setAddModalOpen(false);
                        setEditingTask(null);
                    }}
                    onSave={handleSave}
                    data-cy="index-add-task-modal-set-add-modal-open"
                />

                {/* View task modal ("Open" action) */}
                <Modal
                    open={!!viewTask}
                    onClose={() => setViewTask(null)}
                    title={viewTask?.task ?? ''}
                    maxWidth={440}
                    data-cy="index-modal-set-view-task"
                >
                    {viewTask && (
                        <div
                            className="flex flex-col gap-3 text-sm"
                            data-cy="index-div-119"
                        >
                            <div
                                className="flex items-center gap-2"
                                data-cy="index-div-120"
                            >
                                <span
                                    className={cn(
                                        'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                                        STATUS_STYLE[viewTask.status],
                                    )}
                                    data-cy="index-span-121"
                                >
                                    {STATUS_LABEL[viewTask.status]}
                                </span>
                                <span
                                    className="font-mono text-xs text-neutral-500"
                                    data-cy="index-span-122"
                                >
                                    {viewTask.batch?.batch_code}
                                </span>
                            </div>
                            <p
                                className="text-neutral-600"
                                data-cy="index-p-123"
                            >
                                {viewTask.description}
                            </p>
                            <div
                                className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-neutral-50 p-3 text-xs"
                                data-cy="index-div-124"
                            >
                                <div data-cy="index-div-125">
                                    <span
                                        className="text-neutral-500"
                                        data-cy="index-span-trainee"
                                    >
                                        Trainee
                                    </span>
                                    <div
                                        className="font-medium text-ink"
                                        data-cy="index-div-127"
                                    >
                                        {personName(viewTask.trainee)}
                                    </div>
                                </div>
                                <div data-cy="index-div-128">
                                    <span
                                        className="text-neutral-500"
                                        data-cy="index-span-trainer"
                                    >
                                        Trainer
                                    </span>
                                    <div
                                        className="font-medium text-ink"
                                        data-cy="index-div-130"
                                    >
                                        {personName(viewTask.trainer)}
                                    </div>
                                </div>
                                <div data-cy="index-div-131">
                                    <span
                                        className="text-neutral-500"
                                        data-cy="index-span-date"
                                    >
                                        Date
                                    </span>
                                    <div
                                        className="font-mono font-medium text-ink"
                                        data-cy="index-div-133"
                                    >
                                        {viewTask.date?.slice(0, 10)}
                                    </div>
                                </div>
                                <div data-cy="index-div-134">
                                    <span
                                        className="text-neutral-500"
                                        data-cy="index-span-time-goal"
                                    >
                                        Time goal
                                    </span>
                                    <div
                                        className="font-mono font-medium text-ink"
                                        data-cy="index-div-h"
                                    >
                                        {Number(viewTask.time_goal)}h
                                    </div>
                                </div>
                                <div data-cy="index-div-137">
                                    <span
                                        className="text-neutral-500"
                                        data-cy="index-span-time-spent"
                                    >
                                        Time spent
                                    </span>
                                    <div
                                        className="font-mono font-medium text-ink"
                                        data-cy="index-div-139"
                                    >
                                        {Number(viewTask.time_spent)}h
                                    </div>
                                </div>
                            </div>
                            <div data-cy="index-div-140">
                                <label
                                    className="mb-1.5 block text-xs font-medium text-neutral-600"
                                    data-cy="index-label-remarks"
                                >
                                    Remarks
                                </label>
                                <textarea
                                    key={viewTask.id}
                                    value={viewRemarks}
                                    onChange={(e) =>
                                        setViewRemarks(e.target.value)
                                    }
                                    disabled={viewTask.status === 'locked'}
                                    placeholder="Add remarks..."
                                    rows={3}
                                    className="w-full resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-ink transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:text-neutral-400"
                                    data-cy="index-textarea-add-remarks"
                                />
                                {viewTask.status === 'locked' && (
                                    <p
                                        className="mt-1 text-xs text-neutral-400"
                                        data-cy="index-p-locked-remarks"
                                    >
                                        Remarks are locked while this task's
                                        status is Locked.
                                    </p>
                                )}
                            </div>
                            <div
                                className="mt-1 flex justify-end gap-2"
                                data-cy="index-div-144"
                            >
                                <Button
                                    variant="secondary"
                                    onClick={() => setViewTask(null)}
                                    data-cy="index-button-set-view-task-2"
                                >
                                    Close
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={saveRemarks}
                                    disabled={viewTask.status === 'locked'}
                                    data-cy="index-button-commit-remarks"
                                >
                                    Save remarks
                                </Button>
                            </div>
                        </div>
                    )}
                </Modal>
            </div>
        </TasksPrimaryLayout>
    );
}
