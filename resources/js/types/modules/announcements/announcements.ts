import { formatDateTime } from '@/lib/date';
import { apiFetchJson } from '@/lib/apiFetch';
import type { ColumnDef } from '@/types/reusable/data-table';
import {
    FieldDef,
    FieldOption,
    loadLookupOptions,
} from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

/**
 * Row shape returned by `/announcements` (AnnoucementController extends
 * BaseController — table `app_announcement`).
 */
export interface Announcements extends Record<string, unknown> {
    id: number;
    created_by_id: number | null;
    status: string;
    subject: string;
    audience: string | null;
    description: string | null;
    scheduled_at: string | null;
    notified_at: string | null;
    audience_type: 'all' | 'batch' | 'role' | 'custom';
    audience_batch_id: number | null;
    audience_user_ids: number[] | null;
    created_at: string;
    updated_at: string;
}

export const AUDIENCE_TYPE_OPTIONS = [
    { value: '', label: 'All Audiences' },
    { value: 'all', label: 'All trainees' },
    { value: 'batch', label: 'Specific batch' },
    { value: 'role', label: 'Specific role' },
    { value: 'custom', label: 'Custom group' },
] as const;

export const AUDIENCE_ROLE_OPTIONS = [
    { value: 'trainee', label: 'Trainees' },
    { value: 'trainer', label: 'Trainers' },
] as const;

/**
 * Shared trainee option loader for the "Custom group" audience — used by both
 * the create/edit modal's trainee multi-select and the list filter panel's
 * dependent "Trainees" filter, so the two stay in sync automatically.
 */
export async function loadTraineeOptions(
    query: string,
): Promise<FieldOption[]> {
    const res = await apiFetchJson<{
        data: { id: number; first_name: string; last_name: string }[];
    }>(
        `/trainees/pagination-search?filters[status]=active&per_page=50&search=${encodeURIComponent(query)}`,
    );
    return (res.data?.data ?? []).map((p) => ({
        value: String(p.id),
        label: `${p.first_name} ${p.last_name}`,
    }));
}

export type AnnouncementInput = Partial<
    Pick<
        Announcements,
        | 'subject'
        | 'description'
        | 'audience'
        | 'scheduled_at'
        | 'audience_type'
        | 'audience_batch_id'
        | 'audience_user_ids'
    >
>;

export const columns: ColumnDef<Announcements>[] = [
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        filterable: true,
        exactFilters: true,
        type: 'select',
        typeData: STATUS_FILTER_PAIRS,
    },
    {
        key: 'subject',
        label: 'Subject',
        searchable: true,
        sortable: true,
        filterable: true,
    },
    {
        key: 'audience_type',
        label: 'Audience',
        sortable: true,
        filterable: true,
        type: 'select',
        typeData: AUDIENCE_TYPE_OPTIONS.map((o) => ({ ...o })),
        // The dependent filters below only make sense for one audience_type
        // each, so clear whichever doesn't match whenever this changes.
        filterResets: ['audience_batch_id', 'audience', 'audience_user_ids'],
        render: (value) =>
            AUDIENCE_TYPE_OPTIONS.find((o) => o.value === value)?.label ??
            String(value ?? ''),
    },
    {
        // Only relevant once Audience is set to "Specific batch" — see
        // audience_type's showWhen-driven reveal above.
        key: 'audience_batch_id',
        label: 'Batch',
        filterable: true,
        sortable: false,
        type: 'async-select',
        loadOptions: (q) => loadLookupOptions('/batches', q, 'batch_code'),
        showWhen: (filters) => filters.audience_type === 'batch',
    },
    {
        // Only relevant once Audience is set to "Specific role".
        key: 'audience',
        label: 'Role',
        filterable: true,
        sortable: false,
        type: 'select',
        typeData: AUDIENCE_ROLE_OPTIONS.map((o) => ({ ...o })),
        showWhen: (filters) => filters.audience_type === 'role',
    },
    {
        // Only relevant once Audience is set to "Custom group" — mirrors the
        // modal's trainee multi-select for the same audience_type.
        key: 'audience_user_ids',
        label: 'Trainees',
        filterable: true,
        sortable: false,
        type: 'async-multi-select',
        loadOptions: loadTraineeOptions,
        showWhen: (filters) => filters.audience_type === 'custom',
    },
    {
        key: 'scheduled_at',
        label: 'Publish',
        sortable: true,
        render: (_value, row) =>
            row.scheduled_at && new Date(row.scheduled_at) > new Date()
                ? `Scheduled ${formatDateTime(row.scheduled_at)}`
                : row.notified_at
                  ? `Published ${formatDateTime(row.notified_at)}`
                  : 'Not yet published',
    },
    {
        key: 'description',
        label: 'Description',
        searchable: true,
        sortable: true,
        filterable: true,
    },
];

export const fields: FieldDef<Announcements>[] = [
    {
        key: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        colSpan: 2,
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        colSpan: 2,
    },
];
