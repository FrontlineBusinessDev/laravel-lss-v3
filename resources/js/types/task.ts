import type { StatusFilterTab } from '@/types/reusable/data-table';

export type TaskStatus = 'open' | 'completed' | 'locked';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface ApiTask extends Record<string, unknown> {
    id: number;
    status: TaskStatus;
    priority: TaskPriority | null;
    task: string;
    description: string | null;
    time_goal: string | number;
    time_spent: string | number;
    is_running: boolean;
    started_at: string | null;
    date: string;
    remarks: string | null;
    completed_at: string | null;
    batch: {
        id: number;
        batch_code: string;
    } | null;
    trainee: {
        id: number;
        first_name: string;
        last_name: string;
    } | null;
    trainer: {
        id: number;
        first_name: string;
        last_name: string;
    } | null;
}

export const TASK_STATUS_FILTER_OPTIONS: StatusFilterTab[] = [
    { value: 'all', label: 'All' },
    { value: 'open', label: 'Open' },
    { value: 'completed', label: 'Completed' },
    { value: 'locked', label: 'Locked' },
];

export const TASK_PRIORITY_OPTIONS: { label: string; value: TaskPriority }[] = [
    { label: 'High', value: 'high' },
    { label: 'Medium', value: 'medium' },
    { label: 'Low', value: 'low' },
];

export const TASK_STATUS_STYLE: Record<string, string> = {
    open: 'bg-warning-50 text-warning-800',
    completed: 'bg-success-50 text-success-800',
    locked: 'bg-neutral-100 text-neutral-600',
};

export const TASK_STATUS_LABEL: Record<string, string> = {
    open: 'Open',
    completed: 'Completed',
    locked: 'Locked',
};

/**
 * One row per app_tasks.task_group_id — the batch-assignment fan-out
 * (TasksController::paginationSearch()) collapsed into a single Task
 * Management list row. `id` is only the MIN() row id in the group, useful
 * as a React key, never as a per-task target — every mutation on this shape
 * must go through the /tasks/groups/{group_id}/* endpoints, never /tasks/{id}.
 */
export interface ApiTaskGroup extends Record<string, unknown> {
    group_id: string;
    id: number;
    task: string;
    description: string | null;
    date: string;
    priority: TaskPriority | null;
    time_goal: string | number;
    trainee_count: number;
    completed_count: number;
    locked_count: number;
    status: TaskStatus | 'mixed';
    batch: {
        id: number;
        batch_code: string;
    } | null;
    trainer: {
        id: number;
        first_name: string;
        last_name: string;
    } | null;
    created_at: string;
}

export const GROUP_STATUS_STYLE: Record<string, string> = {
    ...TASK_STATUS_STYLE,
    mixed: 'bg-brand-50 text-brand-700',
};

export const GROUP_STATUS_LABEL: Record<string, string> = {
    ...TASK_STATUS_LABEL,
    mixed: 'In progress',
};
