/**
 * @file api-service-layer/trainee/tasks.ts
 * Trainee self-service tasks — `/trainee/tasks`.
 */

import { http, unwrap } from '../client';

export interface TrainerOption {
    id: number;
    first_name: string;
    last_name: string;
}

export interface TaskAggregates {
    total_tasks: number;
    total_hours: number;
}

export const traineeTasksService = {
    runAction: async (
        taskId: string | number,
        action: 'run' | 'stop' | 'complete',
    ): Promise<void> => {
        await http.patch(`/trainee/tasks/${taskId}/${action}`);
    },
    trainers: async (): Promise<TrainerOption[]> =>
        unwrap<TrainerOption[]>(await http.get('/trainee/tasks/trainers')),
    aggregates: async (): Promise<TaskAggregates> =>
        unwrap<TaskAggregates>(await http.get('/trainee/tasks/aggregates')),
};
