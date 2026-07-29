import type { ColumnDef } from '@/types/reusable/data-table';

/**
 * Row shape returned by the batch-scoped trainee listing
 * (GET /batches/{batch}/trainees/pagination-search — BatchTraineesController).
 * `school` is the eager-loaded PartnerSchools relation (snake_case column).
 */
export interface TraineeRow extends Record<string, unknown> {
    id: number;
    status: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string | null;
    initials?: string;
    required_hours: string | number | null;
    termination_remarks?: string | null;
    school?: { id: number; school_name: string } | null;
}

// This list's default view already hides archived (inactive) trainees
// server-side (BatchTraineesController::newQuery()) — "All Status" here means
// "active + terminated", with an explicit option to bring archived back into
// view. Distinct from the shared STATUS_FILTER_PAIRS (active/inactive only),
// which doesn't know about the terminated lifecycle stage.
const BATCH_TRAINEE_STATUS_FILTER_PAIRS = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'terminated', label: 'Terminated' },
    { value: 'inactive', label: 'Archived' },
];

/**
 * Columns for the trainee DataTableField. Only backend-sortable keys are marked
 * sortable (see BatchTraineesController::$sortable); `school` is a relation, so
 * it is display-only.
 */
export const columns: ColumnDef<TraineeRow>[] = [
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        filterable: true,
        type: 'select',
        typeData: BATCH_TRAINEE_STATUS_FILTER_PAIRS,
    },
    {
        key: 'first_name',
        label: 'First Name',
        searchable: true,
        sortable: true,
        filterable: true,
    },
    {
        key: 'last_name',
        label: 'Last Name',
        searchable: true,
        sortable: true,
        filterable: true,
    },
    { key: 'school', label: 'School', sortable: false, filterable: true },
    { key: 'required_hours', label: 'Required hrs', sortable: true },
];
