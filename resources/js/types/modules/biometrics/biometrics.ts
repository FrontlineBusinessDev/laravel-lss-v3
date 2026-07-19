/**
 * @file types/modules/biometrics/biometrics.ts
 * Real 4-checkpoint biometrics schema shared by the Admin biometrics module
 * (resources/js/pages/developer/biometrics) and the read-only trainee detail
 * tab (resources/js/pages/developer/trainees/show/BiometricsTab.tsx).
 */

export type BiometricImportStatus = 'success' | 'partial' | 'failed';

/** One trainee's attendance log for one date, as returned by the backend. */
export interface BiometricLogRow {
    id: number;
    trainee_id: number;
    trainee_name: string;
    batch_id: number | null;
    batch_code: string | null;
    date: string; // YYYY-MM-DD
    morning_time_in: string | null; // HH:MM
    lunch_time_out: string | null; // HH:MM
    afternoon_time_in: string | null; // HH:MM
    day_time_out: string | null; // HH:MM
    on_leave: boolean;
    remarks: string | null;
    total_hours: number;
    exceptions: string[];
    import_id: number | null;
}

/** Read-only row shape for the trainee detail tab — no trainee/batch redundancy (already the page's context). */
export interface TraineeBiometricRow {
    id: number;
    date: string;
    morning_time_in: string | null;
    lunch_time_out: string | null;
    afternoon_time_in: string | null;
    day_time_out: string | null;
    on_leave: boolean;
    remarks: string | null;
    total_hours: number;
    exceptions: string[];
}

export interface TraineeBiometricSummary {
    total_days: number;
    total_hours: number;
    exceptions_count: number;
}

export interface TraineeBiometricsResponse {
    records: TraineeBiometricRow[];
    summary: TraineeBiometricSummary;
}

export interface BiometricImportSummary {
    id: number;
    file_name: string;
    imported_by: string;
    imported_at: string;
    total_rows: number;
    success_count: number;
    error_count: number;
    status: BiometricImportStatus;
}

/** One CSV row after client-side parsing/validation, ready to POST to the import endpoint. */
export interface BiometricImportRowInput {
    trainee_id: number;
    date: string;
    morning_time_in: string | null;
    lunch_time_out: string | null;
    afternoon_time_in: string | null;
    day_time_out: string | null;
    on_leave: boolean;
    remarks: string | null;
}

export interface BiometricImportPayload {
    file_name: string;
    rows: BiometricImportRowInput[];
    total_rows: number;
    error_count: number;
}

export interface BiometricImportResult {
    import: BiometricImportSummary;
    created_count: number;
    skipped_count: number;
}

export interface BiometricRecordsQuery {
    batch_id?: number | string;
    import_id?: 'latest' | 'all' | number | string;
    search?: string;
    date_from?: string;
    date_to?: string;
    [key: string]: unknown;
}

export interface TraineeBiometricsQuery {
    start_date?: string;
    end_date?: string;
    training_period_id?: number | string;
    [key: string]: unknown;
}

export interface BiometricRecordUpdateInput {
    date: string;
    morning_time_in: string | null;
    lunch_time_out: string | null;
    afternoon_time_in: string | null;
    day_time_out: string | null;
    on_leave: boolean;
    remarks: string | null;
}
