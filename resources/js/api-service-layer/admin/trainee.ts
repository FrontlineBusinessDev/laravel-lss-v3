/**
 * @file api-service-layer/admin/trainee.ts
 * Trainees service — read-only. Backend registers only `GET /trainees`
 * (index) and `GET /trainees/{id}` (show), so no mutation methods exist here.
 */

import type { AppTrainees } from '@/types/modules/trainees/trainees';
import type { CrudQueryParams } from '@/types/reusable/pagination';
import { http, unwrap } from '../client';
import { buildQueryString } from '../form-data';

function suffix(params?: CrudQueryParams): string {
    if (!params) {
        return '';
    }

    const qs = buildQueryString(params);

    return qs ? `?${qs}` : '';
}

export const traineeService = {
    /** GET /trainees — index list. */
    getAll: async (params?: CrudQueryParams): Promise<AppTrainees[]> =>
        unwrap<AppTrainees[]>(await http.get(`/trainees${suffix(params)}`)),

    /** GET /trainees/{id} — single trainee. */
    show: async (id: string | number): Promise<AppTrainees> =>
        unwrap<AppTrainees>(await http.get(`/trainees/${id}`)),
};
