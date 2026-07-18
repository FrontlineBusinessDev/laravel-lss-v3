import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FolderOpen, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type { RowMenuAction } from '@/components/RowMenu';
import { RowMenu } from '@/components/RowMenu';
import { SettingsListHeader, TextCell } from '@/components/settings';
import { TaskPriorityBadge } from '@/components/task/TaskPriorityBadge';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { useToast } from '@/hooks/use-toast';
import TrainerLayout from '@/layouts/trainer/TrainerLayout';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import { AddTaskModal, type TaskSavePayload } from '@/pages/developer/tasks/AddTaskModal';
import { ApiTask, TASK_STATUS_FILTER_OPTIONS } from '@/types/task';
import type { CardActions } from '@/types/reusable/card';
import type { ColumnDef } from '@/types/reusable/data-table';
import DailyTaskSheetTab from './daily-task';

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

function personName(p: { first_name: string; last_name: string } | null): string {
    return p ? `${p.first_name} ${p.last_name}`.trim() : '—';
}

const customGRID =
    'sm:grid-cols-[0.7fr_0.7fr_0.7fr_1fr_1.2fr_0.6fr_0.6fr_0.9fr_0.9fr_0.7fr_2.5rem]!';

const columns: ColumnDef<ApiTask>[] = [
    { key: 'task', label: 'Task', searchable: true },
    { key: 'date', label: 'Date', type: 'date-range', filterable: true, sortable: true },
    { key: 'created_at', label: 'Date created', sortable: true },
];

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
            'Time spent',
            'Trainee',
            'Trainer',
            'Date',
        ]}
    />
);

/**
 * Task Management + Daily Task Sheet, scoped to this trainer's assigned
 * batches — the shared /tasks JSON API already enforces that server-side
 * (TasksController::scopeTrainerBatches()); this page just needs its own
 * batch picker restricted (AddTaskModal's batchLookupUrl) so the create form
 * never offers a batch the backend would reject.
 */
export default function TrainerTasksPage() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [tab, setTab] = useState<'management' | 'daily'>('management');
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
                toast({ description: `"${payload.task}" updated.`, variant: 'success' });
            } else {
                const { mode: _mode, ...body } = payload;
                await apiFetchJson('/tasks', {
                    method: 'POST',
                    body: JSON.stringify(body),
                });
                toast({ description: `Task "${payload.task}" assigned.`, variant: 'success' });
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
            await apiFetchJson(`/tasks/${task.id}/complete`, { method: 'PATCH' });
            toast({ description: `"${task.task}" marked as complete.`, variant: 'success' });
            invalidateTasks();
        } catch {
            toast({ description: 'Failed to complete task.', variant: 'error' });
        }
    }
    async function runLock(task: ApiTask) {
        try {
            await apiFetchJson(`/tasks/${task.id}/lock`, { method: 'PATCH' });
            toast({ description: `"${task.task}" locked.`, variant: 'success' });
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
                description: 'This task is locked and remarks can no longer be edited.',
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
            { label: 'Edit', icon: Pencil, onClick: actions.onEdit },
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
            <div className={cn('flex flex-col gap-1 px-4 py-3', 'sm:grid sm:items-center sm:gap-2', customGRID)}>
                <div>
                    <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[row.status])}>
                        {STATUS_LABEL[row.status]}
                    </span>
                </div>
                <div>
                    <TaskPriorityBadge priority={row.priority} />
                </div>
                <TextCell muted>{row.batch?.batch_code ?? '—'}</TextCell>
                <TextCell muted>{row.task}</TextCell>
                <TextCell muted>{row.description ?? '—'}</TextCell>
                <TextCell muted>{Number(row.time_goal)}h</TextCell>
                <TextCell muted>
                    {Number(row.time_spent ?? 0)}h
                    {row.is_running && <span className="ml-1 text-warning-600">●</span>}
                </TextCell>
                <TextCell muted>{personName(row.trainee)}</TextCell>
                <TextCell muted>{personName(row.trainer)}</TextCell>
                <TextCell muted>{row.date?.slice(0, 10)}</TextCell>
                <div className="flex items-center justify-end sm:justify-self-end">
                    <RowMenu actions={menu} />
                </div>
            </div>
        );
    };

    return (
        <TrainerLayout title="Tasks">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-1 text-sm font-medium">
                    <button
                        type="button"
                        onClick={() => setTab('management')}
                        className={cn(
                            'rounded-[5px] px-3 py-1.5 transition-colors',
                            tab === 'management' ? 'bg-white text-ink shadow-card' : 'text-neutral-500',
                        )}
                    >
                        Task Management
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('daily')}
                        className={cn(
                            'rounded-[5px] px-3 py-1.5 transition-colors',
                            tab === 'daily' ? 'bg-white text-ink shadow-card' : 'text-neutral-500',
                        )}
                    >
                        Daily Task Sheet
                    </button>
                </div>
                {tab === 'management' && (
                    <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => {
                            setEditingTask(null);
                            setAddModalOpen(true);
                        }}
                    >
                        Add task
                    </Button>
                )}
            </div>

            {tab === 'management' ? (
                <>
                    <DataTableCardField<ApiTask>
                        apiUrl="/tasks"
                        apiQueryKey="trainer-tasks"
                        columns={columns}
                        listHeader={listHeader}
                        renderCard={renderRow}
                        enableStatusFilter
                        statusFilterOptions={TASK_STATUS_FILTER_OPTIONS}
                        onEditRow={(row) => {
                            setEditingTask(row);
                            setAddModalOpen(true);
                        }}
                    />

                    <AddTaskModal
                        open={addModalOpen}
                        onClose={() => {
                            setAddModalOpen(false);
                            setEditingTask(null);
                        }}
                        onSave={handleSave}
                        editingTask={editingTask}
                        batchLookupUrl="/trainer/batches/lookup"
                    />

                    <Modal
                        open={viewTask !== null}
                        onClose={() => setViewTask(null)}
                        title={viewTask?.task ?? ''}
                        description={viewTask ? `${personName(viewTask.trainee)} · ${viewTask.batch?.batch_code ?? '—'}` : undefined}
                    >
                        <div className="mb-3.5">
                            <label className="mb-1.5 block text-xs font-medium text-neutral-600">
                                Remarks
                            </label>
                            <textarea
                                className="w-full rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-ink placeholder:text-neutral-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                rows={4}
                                value={viewRemarks}
                                onChange={(e) => setViewRemarks(e.target.value)}
                                disabled={viewTask?.status === 'locked'}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setViewTask(null)}>
                                Close
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => void saveRemarks()}
                                disabled={viewTask?.status === 'locked'}
                            >
                                Save remarks
                            </Button>
                        </div>
                    </Modal>
                </>
            ) : (
                <DailyTaskSheetTab />
            )}
        </TrainerLayout>
    );
}
