import type { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef, staticOptions } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

/**
 * Row shape returned by the batch-scoped trainee listing
 * (GET /batches/{batch}/trainees/pagination-search — BatchTraineesController).
 * `school` is the eager-loaded PartnerSchools relation (snake_case column).
 */
export interface Announcements extends Record<string, unknown> {
    id: number;
    status: string;
    subject: string;
    audience: string;
    description: string;
    created_at: string;
    updated_at: string;
    postedBy: string;
}

/**
 * Columns for the trainee DataTableField. Only backend-sortable keys are marked
 * sortable (see BatchTraineesController::$sortable); `school` is a relation, so
 * it is display-only.
 */
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
        key: 'description',
        label: 'Description',
        searchable: true,
        sortable: true,
        filterable: true,
    },
];

// Create/edit modal fields. batch_code and public_registration_url_id are
// intentionally absent — both are system-generated and protected from input.
export const fields: FieldDef<Announcements>[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'checkbox',
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
        key: 'description',
        label: 'Description',
        type: 'textarea',
        required: true,
        colSpan: 2,
    },
];
