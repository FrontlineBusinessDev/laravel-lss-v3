import type { ColumnDef } from '@/types/reusable/data-table';
import {
    loadLookupOptions,
    staticOptions,
    type FieldDef,
    type FieldOption,
} from '@/types/reusable/fields';

export interface AppBatches extends Record<string, unknown> {
    id: number;
    status: string;
    batch_code: string;
    // System-generated, user-protected public sign-up token (matches the
    // app_batches migration column). Never edited from the client.
    public_registration_url_id: string;
    date_started: string;
    setup: 'f2f' | 'online';
    academic_industry_id: number;
    academic_level_id: number;
    academic_program_id: number;
    trainees_count?: number;
    is_public_url_enable?: boolean;
    // Eager-loaded relations (serialized snake_case by Laravel) — present when
    // the list query uses `with()`. Used for list cells + async-select labels.
    academic_industry?: { id: number; name: string } | null;
    academic_level?: { id: number; name: string } | null;
    academic_program?: { id: number; name: string } | null;
    trainers?: { id: number; first_name: string; last_name: string; email: string }[];
    created_at: string;
    updated_at: string;
}

/** Setup delivery format options — shared by the modal field + filter. */
export const SETUP_OPTIONS: FieldOption[] = [
    { value: 'f2f', label: 'Face to Face (F2F)' },
    { value: 'online', label: 'Online' },
];

/** Hardcoded batch lifecycle statuses (per the module spec). */
export const STATUS_OPTIONS: FieldOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'completed', label: 'Completed' },
    { value: 'terminated', label: 'Terminated' },
];

export const columns: ColumnDef<AppBatches>[] = [
    { key: 'batch_code', label: 'Batch Code', searchable: true },
    {
        key: 'academic_program_id',
        label: 'Program Type',
        type: 'async-select',
        filterable: true,
        sortable: false,
        loadOptions: (q) => loadLookupOptions('/settings/academic/program', q),
    },
    {
        key: 'academic_industry_id',
        label: 'Industry',
        type: 'async-select',
        filterable: true,
        sortable: false,
        loadOptions: (q) => loadLookupOptions('/settings/academic/industry', q),
    },
    {
        key: 'academic_level_id',
        label: 'Level',
        type: 'async-select',
        filterable: true,
        sortable: false,
        loadOptions: (q) => loadLookupOptions('/settings/academic/level', q),
    },
    {
        key: 'setup',
        label: 'Setup',
        type: 'async-select',
        filterable: true,
        sortable: false,
        loadOptions: staticOptions(SETUP_OPTIONS),
    },
    {
        key: 'status',
        label: 'Status',
        type: 'async-select',
        filterable: true,
        sortable: false,
        loadOptions: staticOptions(STATUS_OPTIONS),
    },
    { key: 'date_started', label: 'Date Started' },
    { key: 'created_at', label: 'Created' },
];

// Create/edit modal fields. batch_code and public_registration_url_id are
// intentionally absent — both are system-generated and protected from input.
export const fields: FieldDef<AppBatches>[] = [
    {
        key: 'academic_program_id',
        label: 'Program Type',
        type: 'async-select',
        required: true,
        placeholder: 'Select program…',
        colSpan: 2,
        loadOptions: (q) => loadLookupOptions('/settings/academic/program', q),
        initialLabel: (row) => row.academic_program?.name,
    },
    {
        key: 'academic_industry_id',
        label: 'Industry',
        type: 'async-select',
        required: true,
        placeholder: 'Select industry…',
        colSpan: 2,
        loadOptions: (q) => loadLookupOptions('/settings/academic/industry', q),
        initialLabel: (row) => row.academic_industry?.name,
    },
    {
        key: 'academic_level_id',
        label: 'Academic Level',
        type: 'async-select',
        required: true,
        placeholder: 'Select level…',
        colSpan: 2,
        loadOptions: (q) => loadLookupOptions('/settings/academic/level', q),
        initialLabel: (row) => row.academic_level?.name,
    },
    {
        key: 'is_public_url_enable',
        label: 'Enable Public URL',
        type: 'checkbox',
        colSpan: 2,
    },
    {
        key: 'setup',
        label: 'Training Delivery Format',
        type: 'select',
        required: true,
        options: SETUP_OPTIONS,
        colSpan: 2,
    },
    {
        key: 'date_started',
        label: 'Start Date',
        type: 'date',
        required: true,
        colSpan: 2,
    },
];
