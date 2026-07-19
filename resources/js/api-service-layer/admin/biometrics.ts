/**
 * @file api-service-layer/admin/biometrics.ts
 * Biometrics service — `/biometrics/*` (Admin CRUD/import) and
 * `/trainees/{id}/biometrics-data` (trainee detail tab, read-only).
 * Bespoke bindings (not createCrudResource) since attendance rows have no
 * active/inactive archive lifecycle.
 */

import type {
    BiometricImportPayload,
    BiometricImportResult,
    BiometricImportSummary,
    BiometricLogRow,
    BiometricRecordsQuery,
    BiometricRecordUpdateInput,
    TraineeBiometricsQuery,
    TraineeBiometricsResponse,
} from '@/types/modules/biometrics/biometrics';
import { http, unwrap } from '../client';

function query(params?: Record<string, unknown>): string {
    if (!params) return '';
    const usable = Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== '',
    );
    if (usable.length === 0) return '';
    return `?${new URLSearchParams(usable as [string, string][]).toString()}`;
}

export const biometricsService = {
    /** GET /biometrics/records */
    getRecords: async (
        params?: BiometricRecordsQuery,
    ): Promise<BiometricLogRow[]> =>
        unwrap<BiometricLogRow[]>(
            await http.get(`/biometrics/records${query(params)}`),
        ),

    /** GET /biometrics/imports */
    getImports: async (): Promise<BiometricImportSummary[]> =>
        unwrap<BiometricImportSummary[]>(await http.get('/biometrics/imports')),

    /** POST /biometrics/import */
    import: async (
        payload: BiometricImportPayload,
    ): Promise<BiometricImportResult> =>
        unwrap<BiometricImportResult>(
            await http.post('/biometrics/import', payload),
        ),

    /** PATCH /biometrics/records/{id} */
    updateRecord: async (
        id: number | string,
        data: BiometricRecordUpdateInput,
    ): Promise<BiometricLogRow> =>
        unwrap<BiometricLogRow>(
            await http.patch(`/biometrics/records/${id}`, data),
        ),

    /** DELETE /biometrics/records/{id} */
    deleteRecord: async (id: number | string): Promise<void> => {
        await http.delete(`/biometrics/records/${id}`);
    },

    /** GET /trainees/{id}/biometrics-data — read-only, trainee detail tab. */
    getTraineeRecords: async (
        traineeId: number | string,
        params?: TraineeBiometricsQuery,
    ): Promise<TraineeBiometricsResponse> =>
        unwrap<TraineeBiometricsResponse>(
            await http.get(
                `/trainees/${traineeId}/biometrics-data${query(params)}`,
            ),
        ),
};
