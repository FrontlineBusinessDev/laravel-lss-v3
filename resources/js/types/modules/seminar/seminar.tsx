import type { ColumnDef } from '@/types/reusable/data-table';
import {
    staticOptions,
    type FieldDef,
    type FieldOption,
} from '@/types/reusable/fields';

export interface AppSeminar extends Record<string, unknown> {
    id: string;
    status: 'active' | 'completed' | 'closed' | 'dissolved';
    seminar_code: string;
    topic: string;
    description: string;
    date: string;
    venue: string;
    fee: number;
    maxParticipants?: number;
    registeredCount: number;
    /** Seminar type/track (e.g. "Technical & Automation Workshops"). Determines which seminar question set applies. */
    type: string;
    /** Auto-generated on creation. Stays reachable while status === 'active'. */
    registrationLink: string;
    createdAt?: string; // ISO date
    is_public_url_enable: boolean;
    created_at: string;
    updated_at: string;
}

/** Hardcoded batch lifecycle statuses (per the module spec). */
export const STATUS_OPTIONS: FieldOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'closed', label: 'Closed' },
    { value: 'dissolved', label: 'Dissolved' },
];

export const columns: ColumnDef<AppSeminar>[] = [
    { key: 'saminar_code', label: 'Seminar Code', searchable: true },
    {
        key: 'status',
        label: 'Status',
        type: 'async-select',
        filterable: true,
        sortable: false,
        loadOptions: staticOptions(STATUS_OPTIONS),
    },
    { key: 'date', label: 'Date' },
    { key: 'created_at', label: 'Created' },
];

// Create/edit modal fields. saminar_code and public_registration_url_id are
// intentionally absent — both are system-generated and protected from input.
export const fields: FieldDef<AppSeminar>[] = [
    {
        key: 'date_started',
        label: 'Start Date',
        type: 'date',
        required: true,
        colSpan: 2,
    },
    {
        key: 'projected_end_date',
        label: 'Projected End Date',
        type: 'date',
        colSpan: 2,
    },
];
