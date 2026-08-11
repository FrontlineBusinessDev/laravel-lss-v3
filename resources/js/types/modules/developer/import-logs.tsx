import { formatDateTime } from '@/lib/date';
import type { ColumnDef } from '@/types/reusable/data-table';
import type { SettingsImportLogEntry, SettingsImportLogUser } from '@/api-service-layer/developer/settingsImport';

export type { SettingsImportLogEntry as ImportLogRow };

export const TYPE_FILTER_PAIRS = [
    { value: '', label: 'All Types' },
    { value: 'academic', label: 'Academic' },
    { value: 'partner_schools', label: 'Partner Schools' },
    { value: 'batches', label: 'Batches' },
    { value: 'trainees', label: 'Trainees' },
    { value: 'payments', label: 'Payments' },
    { value: 'tasks', label: 'Tasks' },
    { value: 'behavioral_evaluations', label: 'Behavioral Evaluations' },
    { value: 'learning_outcomes', label: 'Learning Outcomes' },
    { value: 'citations', label: 'Citations' },
];

export const STATUS_FILTER_PAIRS = [
    { value: '', label: 'All Statuses' },
    { value: 'success', label: 'Success' },
    { value: 'partial', label: 'Partial' },
    { value: 'failed', label: 'Failed' },
];

export const columns: ColumnDef<SettingsImportLogEntry>[] = [
    {
        key: 'type',
        label: 'Type',
        type: 'select',
        searchable: true,
        filterable: true,
        typeData: TYPE_FILTER_PAIRS,
        exactFilters: true,
    },
    {
        key: 'file_name',
        label: 'File',
        searchable: true,
    },
    {
        key: 'status',
        label: 'Result',
        type: 'select',
        filterable: true,
        typeData: STATUS_FILTER_PAIRS,
        exactFilters: true,
    },
    {
        key: 'created_at',
        label: 'Date',
        sortable: true,
    },
];

const STATUS_STYLES: Record<SettingsImportLogEntry['status'], string> = {
    success: 'bg-success-50 text-success-700',
    partial: 'bg-warning-50 text-warning-700',
    failed: 'bg-danger-50 text-danger-700',
};

export function ImportStatusBadge({ log }: { log: SettingsImportLogEntry }) {
    return (
        <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_STYLES[log.status]}`}>
            {log.success_count}/{log.total_rows} ({log.status})
        </span>
    );
}

/** "First Last", falling back to email, then an em dash for system-run imports. */
export function userLabel(user: SettingsImportLogUser | null): string {
    if (!user) return '—';
    const name = `${user.first_name} ${user.last_name}`.trim();
    return name || user.email;
}

/** Compact, locale-aware timestamp for the Date column. */
export function formatWhen(iso: string): string {
    return formatDateTime(iso);
}
