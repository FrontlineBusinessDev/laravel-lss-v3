/**
 * @file api-service-layer/admin/batch-view.ts
 * Batch detail read tabs — `GET /batches/{id}` (trainees),
 * `/batches/{id}/activity-log`, `/batches/{id}/financial`. Read-only.
 */

import { http, unwrap } from '../client';

export const batchViewService = {
    /** GET /batches/{id} — trainees tab payload. */
    trainees: async <R = unknown>(id: string | number): Promise<R> =>
        unwrap<R>(await http.get(`/batches/${id}`)),

    /** GET /batches/{id}/activity-log */
    activityLog: async <R = unknown>(id: string | number): Promise<R> =>
        unwrap<R>(await http.get(`/batches/${id}/activity-log`)),

    /** GET /batches/{id}/financial */
    financial: async <R = unknown>(id: string | number): Promise<R> =>
        unwrap<R>(await http.get(`/batches/${id}/financial`)),
};
