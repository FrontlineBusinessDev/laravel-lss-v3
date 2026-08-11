/**
 * @file api-service-layer/developer/settingsImport.ts
 * Settings > Import — one generic POST binding reused by every phase
 * (`/settings/import/*`), each accepting `{ file_name, rows }` and returning
 * a shared result envelope. Admin/developer only (server-enforced via
 * `role:admin,developer` middleware).
 */

import { http, unwrap } from '../client';

export interface SettingsImportLogUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
}

export interface SettingsImportLogEntry extends Record<string, unknown> {
    id: number;
    type: string;
    file_name: string;
    status: 'success' | 'partial' | 'failed';
    total_rows: number;
    success_count: number;
    error_count: number;
    imported_by: SettingsImportLogUser | null;
    rolled_back_at: string | null;
    rolled_back_by: SettingsImportLogUser | null;
    created_at: string;
}

export interface SettingsImportResult {
    log: SettingsImportLogEntry;
    created_count: number;
    errors: string[];
    warnings: string[];
}

export interface SettingsImportRollbackResult {
    log: SettingsImportLogEntry;
    deleted_count: number;
    errors: string[];
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

    rollback: async (logId: number): Promise<SettingsImportRollbackResult> =>
        unwrap<SettingsImportRollbackResult>(await http.post(`/settings/import/logs/${logId}/rollback`)),
};
