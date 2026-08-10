import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Lock,
    LockOpen,
    CheckCircle2,
    RotateCcw,
    Users,
    Trash2,
} from 'lucide-react';
import { Button } from '@/components/Button';
import type { RowMenuAction } from '@/components/RowMenu';
import { RowMenu } from '@/components/RowMenu';
import { SettingsListHeader, TextCell } from '@/components/settings';
import { TaskPriorityBadge } from '@/components/task/TaskPriorityBadge';
import type { CardActions } from '@/types/reusable/card';
import type { ColumnDef } from '@/types/reusable/data-table';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { loadLookupOptions, type FieldOption } from '@/types/reusable/fields';
import { cn } from '@/lib/utils';
import TasksPrimaryLayout from '@/layouts/tasks/TasksPrimaryLayout';
import {
    type ApiTaskGroup,
    GROUP_STATUS_LABEL,
    GROUP_STATUS_STYLE,
    TASK_PRIORITY_OPTIONS,
    TASK_STATUS_FILTER_OPTIONS,
} from '@/types/task';
import {
    AddTaskModal,
    type TaskSavePayload,
} from '@/pages/developer/tasks/AddTaskModal';
import { TaskRosterModal } from '@/pages/developer/tasks/TaskRosterModal';

const PERMISSION = 'manage tasks';

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

const columns: ColumnDef<ApiTaskGroup>[] = [
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
            'Trainees',
            'Trainer',
            'Date',
        ]}
        data-cy="index-settings-list-header-1"
    />
);

export default function TasksPage() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [rosterGroup, setRosterGroup] = useState<ApiTaskGroup | null>(null);

    const invalidateTasks = () =>
        queryClient.invalidateQueries({ queryKey: [['tasks']] });

    async function handleCreate(payload: TaskSavePayload) {
        if (payload.mode !== 'create') return;
        try {
            const { mode: _mode, ...body } = payload;
            await apiFetchJson('/tasks', {
                method: 'POST',
                body: JSON.stringify(body),
            });
            showToast(`Task "${payload.task}" assigned.`, 'success');
            setAddModalOpen(false);
            invalidateTasks();
        } catch {
            showToast('Failed to save task.', 'error');
        }
    }
    async function runGroupComplete(row: ApiTaskGroup) {
        try {
            await apiFetchJson(`/tasks/groups/${row.group_id}/complete`, {
                method: 'PATCH',
            });
            showToast(`"${row.task}" marked as complete.`, 'success');
            invalidateTasks();
        } catch {
            showToast('Failed to complete task(s).', 'error');
        }
    }
    async function runGroupLock(row: ApiTaskGroup) {
        try {
            await apiFetchJson(`/tasks/groups/${row.group_id}/lock`, {
                method: 'PATCH',
            });
            showToast(`"${row.task}" locked.`, 'success');
            invalidateTasks();
        } catch {
            showToast('Failed to lock task(s).', 'error');
        }
    }
    async function runGroupUncomplete(row: ApiTaskGroup) {
        try {
            await apiFetchJson(`/tasks/groups/${row.group_id}/uncomplete`, {
                method: 'PATCH',
            });
            showToast(`"${row.task}" marked as open.`, 'success');
            invalidateTasks();
        } catch {
            showToast('Failed to reopen task(s).', 'error');
        }
    }
    async function runGroupUnlock(row: ApiTaskGroup) {
        try {
            await apiFetchJson(`/tasks/groups/${row.group_id}/unlock`, {
                method: 'PATCH',
            });
            showToast(`"${row.task}" unlocked.`, 'success');
            invalidateTasks();
        } catch {
            showToast('Failed to unlock task(s).', 'error');
        }
    }

    const renderRow = (row: ApiTaskGroup, actions: CardActions) => {
        const menu: RowMenuAction[] = [
            {
                label: 'View roster',
                icon: Users,
                onClick: () => setRosterGroup(row),
            },
            {
                label: 'Complete all',
                icon: CheckCircle2,
                onClick: () => runGroupComplete(row),
                disabled: row.status === 'completed' || row.status === 'locked',
            },
            {
                label: 'Lock all',
                icon: Lock,
                onClick: () => runGroupLock(row),
                disabled: row.status === 'locked',
            },
            {
                label: 'Uncomplete all',
                icon: RotateCcw,
                onClick: () => runGroupUncomplete(row),
                disabled: row.completed_count === 0,
            },
            {
                label: 'Unlock all',
                icon: LockOpen,
                onClick: () => runGroupUnlock(row),
                disabled: row.locked_count === 0,
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
                            GROUP_STATUS_STYLE[row.status],
                        )}
                        data-cy="index-span-status"
                    >
                        {GROUP_STATUS_LABEL[row.status]}
                    </span>
                </div>
                <div data-cy="index-div-priority">
                    <TaskPriorityBadge
                        priority={row.priority}
                        data-cy="index-badge-priority"
                    />
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
                <button
                    type="button"
                    className="text-left text-sm text-brand-600 underline-offset-2 hover:underline"
                    onClick={() => setRosterGroup(row)}
                    data-cy="index-button-trainee-count"
                >
                    {row.completed_count}/{row.trainee_count} completed
                </button>
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
        <TasksPrimaryLayout
            data-cy="index-tasks-primary-layout-1"
            actionNode={
                <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => setAddModalOpen(true)}
                    data-cy="index-button-set-add-modal-open"
                >
                    Add tasks
                </Button>
            }
        >
            <div data-cy="index-div-1">
                <DataTableCardField<ApiTaskGroup>
                    apiUrl="/tasks"
                    apiQueryKey="tasks"
                    columns={columns}
                    defaultSortBy="created_at"
                    defaultSortDir="desc"
                    listHeader={listHeader}
                    renderCard={renderRow}
                    enableStatusFilter
                    statusFilterOptions={TASK_STATUS_FILTER_OPTIONS}
                    deletePermission={PERMISSION}
                    deleteUrl={(row) => `/tasks/groups/${row.group_id}`}
                    data-cy="index-data-table-card-field-1"
                />
                {/* Add task modal — creates a new batch-assignment (fan-out). */}
                <AddTaskModal
                    open={addModalOpen}
                    editingTask={null}
                    onClose={() => setAddModalOpen(false)}
                    onSave={handleCreate}
                    data-cy="index-add-task-modal-set-add-modal-open"
                />
                {/* Per-trainee roster behind the group row ("View roster" action). */}
                <TaskRosterModal
                    open={!!rosterGroup}
                    groupId={rosterGroup?.group_id ?? null}
                    groupTask={rosterGroup?.task ?? ''}
                    onClose={() => setRosterGroup(null)}
                    onChanged={invalidateTasks}
                    data-cy="index-task-roster-modal-1"
                />
            </div>
        </TasksPrimaryLayout>
    );
}
