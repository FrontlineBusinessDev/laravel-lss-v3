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
