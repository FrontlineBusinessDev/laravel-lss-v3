/**
 * @file api-service-layer/admin/batch-trainee.ts
 * Batch trainees — nested read endpoint
 * `GET /batches/{batch}/trainees/pagination-search`. Read-only: no mutation
 * methods are exposed because the backend registers none.
 */

import type { TraineeRow } from '@/types/modules/batches/trainees';
import type {
    CrudQueryParams,
    PaginatedResponse,
} from '@/types/reusable/pagination';
import { http, unwrap } from '../client';
import { buildQueryString } from '../form-data';

function suffix(params?: CrudQueryParams): string {
    if (!params) {
        return '';
    }

    const qs = buildQueryString(params);

    return qs ? `?${qs}` : '';
}

export const batchTraineeService = {
    /** GET /batches/{batch}/trainees/pagination-search */
    getPaginatedFilterSearch: async (
        batchId: string | number,
        params?: CrudQueryParams,
    ): Promise<PaginatedResponse<TraineeRow>> =>
        unwrap<PaginatedResponse<TraineeRow>>(
            await http.get(
                `/batches/${batchId}/trainees/pagination-search${suffix(params)}`,
            ),
        ),
};
