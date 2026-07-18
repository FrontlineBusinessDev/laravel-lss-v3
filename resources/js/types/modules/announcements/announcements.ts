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
    audience: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

/** Matches AnnoucementController::storeRules()'s `audience` Rule::in(). */
export const AUDIENCE_OPTIONS = [
    'all trainees',
    'specific batch',
    'trainees with documents',
    'custome group',
] as const;

export type AnnouncementInput = Partial<
    Pick<Announcements, 'status' | 'subject' | 'description' | 'audience'>
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
        key: 'audience',
        label: 'Audience',
        sortable: true,
        filterable: true,
        type: 'select',
        typeData: AUDIENCE_OPTIONS.map((value) => ({ value, label: value })),
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
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
        ],
        required: true,
        colSpan: 2,
    },
    {
        key: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        colSpan: 2,
    },
    {
        key: 'audience',
        label: 'Audience',
        type: 'select',
        options: AUDIENCE_OPTIONS.map((value) => ({ value, label: value })),
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
