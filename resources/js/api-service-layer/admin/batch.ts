/**
 * @file api-service-layer/admin/batch.ts
 * Batches service — `/batches` (crudModule) plus the batch-specific custom
 * endpoints (terminate, toggle-registration, registration payload).
 */

import type { AppBatches } from '@/types/modules/batches/batches';
import { http, unwrap } from '../client';
import { createCrudResource } from '../http';

export type BatchInput = Partial<AppBatches>;

const base = createCrudResource<AppBatches, BatchInput>({ baseUrl: '/batches' });

export const batchService = {
    ...base,

    /** PATCH /batches/{id}/terminate — end a running batch. */
    terminate: async (id: string | number): Promise<AppBatches> =>
        unwrap<AppBatches>(await http.patch(`/batches/${id}/terminate`)),

    /** PATCH /batches/{id}/toggle-registration — open/close registration. */
    toggleRegistration: async (id: string | number): Promise<AppBatches> =>
        unwrap<AppBatches>(await http.patch(`/batches/${id}/toggle-registration`)),

    /** GET /batches/{id}/registration — public registration config/payload. */
    registration: async <R = unknown>(id: string | number): Promise<R> =>
        unwrap<R>(await http.get(`/batches/${id}/registration`)),
};
