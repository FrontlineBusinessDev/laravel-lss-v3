/**
 * @file types/modules/tasks/daily-task.ts
 * Print/report view-model for the Daily Task Sheet — built client-side from
 * the real `/tasks/daily-task/list` API rows (see daily-task.tsx `toRecord()`).
 */
export interface TaskRecord {
    id: string;
    batchNo: string;
    task: string;
    description: string;
    timeGoal: number;
    timeSpent: number;
    trainee: string;
    trainer: string;
    date: string;
    status: 'open' | 'completed' | 'locked';
    onLeave: boolean;
    leaveReason?: string;
    remarks?: string;
}
