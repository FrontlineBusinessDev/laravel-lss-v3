/**
 * @file api-service-layer/trainee/biometrics.ts
 * Read-only attendance log for the logged-in trainee — `/trainee/biometrics-data`.
 */

import { http, unwrap } from '../client';
import type {
    TraineeBiometricsQuery,
    TraineeBiometricsResponse,
} from '@/types/modules/biometrics/biometrics';

function query(params?: Record<string, unknown>): string {
    if (!params) return '';
    const usable = Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
    );
    if (usable.length === 0) return '';
    return `?${new URLSearchParams(usable as [string, string][]).toString()}`;
}

export const traineeBiometricsService = {
    /** GET /trainee/biometrics-data */
    getMyRecords: async (
        params?: TraineeBiometricsQuery,
    ): Promise<TraineeBiometricsResponse> =>
        unwrap<TraineeBiometricsResponse>(
            await http.get(`/trainee/biometrics-data${query(params)}`),
        ),
};
