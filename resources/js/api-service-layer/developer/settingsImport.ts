/**
 * @file api-service-layer/developer/settingsImport.ts
 * Settings > Import — one generic POST binding reused by every phase
 * (`/settings/import/*`), each accepting `{ file_name, rows }` and returning
 * a shared result envelope. Admin/developer only (server-enforced via
 * `role:admin,developer` middleware).
 */

import { http, unwrap } from '../client';

export interface SettingsImportResult {
    log: {
        id: number;
        type: string;
        status: 'success' | 'partial' | 'failed';
        total_rows: number;
        success_count: number;
        error_count: number;
    };
    created_count: number;
    errors: string[];
    warnings: string[];
}

export const settingsImportService = {
    import: async (
        endpoint: string,
        fileName: string,
        rows: Record<string, string>[],
    ): Promise<SettingsImportResult> =>
        unwrap<SettingsImportResult>(
            await http.post(`/settings/import/${endpoint}`, {
                file_name: fileName,
                rows,
            }),
        ),
};
