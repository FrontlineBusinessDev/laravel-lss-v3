import type { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

/**
 * Row shape returned by `/announcements` (AnnoucementController extends
 * BaseController — table `app_announcement`).
 */
export interface Announcements extends Record<string, unknown> {
    id: number;
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
    { value: 'all', label: 'All trainees' },
    { value: 'batch', label: 'Specific batch' },
    { value: 'role', label: 'Specific role' },
    { value: 'custom', label: 'Custom group' },
] as const;

export const AUDIENCE_ROLE_OPTIONS = [
    { value: 'trainee', label: 'Trainees' },
    { value: 'trainer', label: 'Trainers' },
] as const;

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
        render: (value) =>
            AUDIENCE_TYPE_OPTIONS.find((o) => o.value === value)?.label ??
            String(value ?? ''),
    },
    {
        key: 'scheduled_at',
        label: 'Publish',
        sortable: true,
        render: (_value, row) =>
            row.scheduled_at && new Date(row.scheduled_at) > new Date()
                ? `Scheduled ${row.scheduled_at.slice(0, 10)}`
                : row.notified_at
                  ? `Published ${row.notified_at.slice(0, 10)}`
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
