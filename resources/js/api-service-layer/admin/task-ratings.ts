/**
 * @file api-service-layer/admin/task-ratings.ts
 * Task Rating tab (`/ratings/task-rating`) service. Shared by the admin
 * and trainer Ratings pages — every endpoint is already batch-scoped
 * server-side via ScopesToAssignedBatches regardless of caller.
 */

import type {
    TaskRatingEntry,
    TaskRatingHistoryApiEntry,
    TaskRatingPerson,
    TaskRatingSubmission,
} from '@/types/modules/ratings/task-rating';
import { http, unwrap } from '../client';

export const taskRatingsService = {
    taskOptions: async (batchId: string | number): Promise<string[]> =>
        unwrap<string[]>(
            await http.get(`/ratings/task-rating/task-options?batch_id=${batchId}`),
        ),
    trainees: async (batchId: string | number): Promise<TaskRatingPerson[]> =>
        unwrap<TaskRatingPerson[]>(
            await http.get(`/ratings/task-rating/trainees?batch_id=${batchId}`),
        ),
    entries: async (
        batchId: string | number,
        taskName: string,
    ): Promise<TaskRatingEntry[]> =>
        unwrap<TaskRatingEntry[]>(
            await http.get(
                `/ratings/task-rating/entries?batch_id=${batchId}&task_name=${encodeURIComponent(taskName)}`,
            ),
        ),
    submit: async (payload: TaskRatingSubmission): Promise<TaskRatingEntry> =>
        unwrap<TaskRatingEntry>(
            await http.post('/ratings/task-rating/entries', payload),
        ),
    history: async (
        id: number | string,
    ): Promise<TaskRatingHistoryApiEntry[]> =>
        unwrap<TaskRatingHistoryApiEntry[]>(
            await http.get(`/ratings/task-rating/${id}/history`),
        ),
};
