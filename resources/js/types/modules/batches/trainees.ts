import type { ColumnDef } from '@/types/reusable/data-table';
import { staticOptions } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

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
    school?: { id: number; school_name: string } | null;
}

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
        loadOptions: staticOptions(STATUS_FILTER_PAIRS),
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
