/**
 * @file api-service-layer/admin/batch-view.ts
 * Batch detail read tabs — `GET /batches/{id}` (trainees),
 * `/batches/{id}/activity-log`, `/batches/{id}/financial`,
 * `/batches/{id}/trainers`. Read-only except assignTrainers.
 */

import type { LookupOption } from '../http';
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

    /** GET /batches/{id}/trainers */
    trainers: async <R = unknown>(id: string | number): Promise<R> =>
        unwrap<R>(await http.get(`/batches/${id}/trainers`)),

    /** GET /batches/trainer-options — all users holding the trainer role. */
    trainerOptions: async (): Promise<LookupOption[]> =>
        unwrap<LookupOption[]>(await http.get('/batches/trainer-options')),

    /** PATCH /batches/{id}/trainers — sync the full assigned-trainer set. */
    assignTrainers: async <R = unknown>(
        id: string | number,
        trainerIds: number[],
    ): Promise<R> =>
        unwrap<R>(
            await http.patch(`/batches/${id}/trainers`, {
                trainer_ids: trainerIds,
            }),
        ),
};
