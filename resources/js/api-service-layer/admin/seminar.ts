/**
 * @file api-service-layer/admin/batch.ts
 * Seminars service — `/seminars` (crudModule) plus the batch-specific custom
 * endpoints (terminate, toggle-registration, registration payload).
 */

import { http, unwrap } from '../client';
import { createCrudResource } from '../http';
import { AppSeminar } from '@/types/modules/seminar/seminar';

export type seminarInput = Partial<AppSeminar>;

const base = createCrudResource<AppSeminar, seminarInput>({
    baseUrl: '/seminars/list-of-seminars',
});

export const seminarService = {
    ...base,

    /** PATCH /seminars/{id}/terminate — end a running batch. */
    terminate: async (id: string | number): Promise<AppSeminar> =>
        unwrap<AppSeminar>(await http.patch(`/seminars/${id}/terminate`)),

    /** PATCH /seminars/{id}/toggle-registration — open/close registration. */
    toggleRegistration: async (id: string | number): Promise<AppSeminar> =>
        unwrap<AppSeminar>(
            await http.patch(`/seminars/${id}/toggle-registration`),
        ),

    /** GET /seminars/{id}/registration — public registration config/payload. */
    registration: async <R = unknown>(id: string | number): Promise<R> =>
        unwrap<R>(await http.get(`/seminars/${id}/registration`)),
};
