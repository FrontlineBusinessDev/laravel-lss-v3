import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Lock, LockOpen, Pencil, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import type { RowMenuAction } from '@/components/RowMenu';
import { RowMenu } from '@/components/RowMenu';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import { AddTaskModal  } from '@/pages/developer/tasks/AddTaskModal';
import type {TaskSavePayload} from '@/pages/developer/tasks/AddTaskModal';
import { TASK_STATUS_LABEL, TASK_STATUS_STYLE  } from '@/types/task';
import type {ApiTask} from '@/types/task';

function personName(
    p: { first_name: string; last_name: string } | null,
): string {
    return p ? `${p.first_name} ${p.last_name}`.trim() : '—';
}

interface TaskRosterModalProps {
    open: boolean;
    groupId: string | null;
    groupTask: string;
    onClose: () => void;
    onChanged: () => void;
}

/**
 * Per-trainee detail behind one Task Management group row. Every action here
 * targets a single app_tasks row (/tasks/{id}/...), unlike the group-level
 * actions in tasks/index.tsx which hit /tasks/groups/{group_id}/....
 */
export function TaskRosterModal({
    open,
    groupId,
    groupTask,
    onClose,
    onChanged,
}: TaskRosterModalProps) {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [editingRow, setEditingRow] = useState<ApiTask | null>(null);

    const rosterQuery = useQuery({
        queryKey: ['task-roster', groupId],
        queryFn: () =>
            apiFetchJson<ApiTask[]>(`/tasks/groups/${groupId}/roster`),
        enabled: open && !!groupId,
    });
    const rows = rosterQuery.data?.data ?? [];

    function refresh() {
        queryClient.invalidateQueries({ queryKey: ['task-roster', groupId] });
        onChanged();
    }

    async function runAction(row: ApiTask, action: 'complete' | 'lock' | 'reopen') {
        try {
            await apiFetchJson(`/tasks/${row.id}/${action}`, { method: 'PATCH' });
            showToast(`"${row.task}" updated for ${personName(row.trainee)}.`, 'success');
            refresh();
        } catch {
            showToast('Failed to update task.', 'error');
        }
    }

    async function runDelete(row: ApiTask) {
        try {
            await apiFetchJson(`/tasks/${row.id}`, { method: 'DELETE' });
            showToast(`Removed ${personName(row.trainee)} from "${row.task}".`, 'success');
            refresh();
        } catch {
            showToast('Failed to remove task.', 'error');
        }
    }

    async function handleEditSave(payload: TaskSavePayload) {
        if (payload.mode !== 'edit') {
return;
}

        try {
            const { id, mode: _mode, ...body } = payload;
            await apiFetchJson(`/tasks/${id}`, {
                method: 'POST',
                body: JSON.stringify(body),
            });
            showToast(`"${payload.task}" updated.`, 'success');
            setEditingRow(null);
            refresh();
        } catch {
            showToast('Failed to save task.', 'error');
        }
    }

    return (
        <>
            <Modal
                open={open}
                onClose={onClose}
                title={groupTask}
                description="Roster for this batch-assigned task."
                maxWidth={560}
                data-cy="task-roster-modal-modal"
            >
                <div className="flex flex-col gap-2" data-cy="task-roster-modal-div-list">
                    {rosterQuery.isLoading && (
                        <p className="text-sm text-neutral-500" data-cy="task-roster-modal-p-loading">
                            Loading roster…
                        </p>
                    )}
                    {!rosterQuery.isLoading && rows.length === 0 && (
                        <p className="text-sm text-neutral-500" data-cy="task-roster-modal-p-empty">
                            No trainees found for this task.
                        </p>
                    )}
                    {rows.map((row) => {
                        const menu: RowMenuAction[] = [
                            {
                                label: 'Edit',
                                icon: Pencil,
                                onClick: () => setEditingRow(row),
                            },
                            {
                                label: 'Complete',
                                icon: CheckCircle2,
                                onClick: () => runAction(row, 'complete'),
                                disabled: row.status === 'completed',
                            },
                            {
                                label: 'Lock',
                                icon: Lock,
                                onClick: () => runAction(row, 'lock'),
                                disabled: row.status === 'locked',
                            },
                            {
                                label: 'Uncomplete',
                                icon: RotateCcw,
                                onClick: () => runAction(row, 'reopen'),
                                disabled: row.status !== 'completed',
                            },
                            {
                                label: 'Unlock',
                                icon: LockOpen,
                                onClick: () => runAction(row, 'reopen'),
                                disabled: row.status !== 'locked',
                            },
                            {
                                label: 'Delete',
                                icon: Trash2,
                                danger: true,
                                onClick: () => void runDelete(row),
                            },
                        ];

                        return (
                            <div
                                key={row.id}
                                className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 px-3 py-2"
                                data-cy="task-roster-modal-div-row"
                            >
                                <div className="min-w-0" data-cy="task-roster-modal-div-info">
                                    <p className="truncate text-sm font-medium text-ink" data-cy="task-roster-modal-p-trainee">
                                        {personName(row.trainee)}
                                    </p>
                                    <p className="text-xs text-neutral-500" data-cy="task-roster-modal-p-hours">
                                        {Number(row.time_spent ?? 0)}h / {Number(row.time_goal)}h
                                    </p>
                                </div>
                                <div className="flex items-center gap-2" data-cy="task-roster-modal-div-actions">
                                    <span
                                        className={cn(
                                            'inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium',
                                            TASK_STATUS_STYLE[row.status],
                                        )}
                                        data-cy="task-roster-modal-span-status"
                                    >
                                        {TASK_STATUS_LABEL[row.status]}
                                    </span>
                                    <RowMenu actions={menu} data-cy="task-roster-modal-row-menu" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Modal>

            <AddTaskModal
                open={!!editingRow}
                editingTask={
                    editingRow
                        ? {
                              id: editingRow.id,
                              date: editingRow.date,
                              task: editingRow.task,
                              description: editingRow.description,
                              time_goal: editingRow.time_goal,
                              priority: editingRow.priority,
                              batch: editingRow.batch,
                              trainee: editingRow.trainee,
                              trainer: editingRow.trainer,
                          }
                        : null
                }
                onClose={() => setEditingRow(null)}
                onSave={handleEditSave}
                data-cy="task-roster-modal-add-task-modal"
            />
        </>
    );
}
