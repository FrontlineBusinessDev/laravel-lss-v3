/**
 * @file api-service-layer/developer/job-runs.ts
 * Generic queued-job status/cancel, polled by the reusable progress-toast
 * system (`@/components/AsyncOperations`). Any backend action that dispatches
 * a job and creates a JobRun row (see app/Models/JobRun.php) can be tracked
 * through these same two endpoints.
 */

import { http, unwrap } from '../client';

export interface JobRunStatus {
    id: string;
    status: 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
    total: number;
    processed: number;
    result: Record<string, unknown> | null;
    error: string | null;
}

export const jobRunsService = {
    status: async (id: string): Promise<JobRunStatus> =>
        unwrap<JobRunStatus>(await http.get(`/job-runs/${id}`)),

    cancel: async (id: string): Promise<void> => {
        await http.post(`/job-runs/${id}/cancel`);
    },
};
