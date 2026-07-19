import type { ColumnDef } from '@/types/reusable/data-table';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

export interface LeaveRequestTrainee {
    id: number;
    first_name: string;
    last_name: string;
    batch_id: number;
}

export interface LeaveRequestBatch {
    id: number;
    batch_code: string;
}

export interface LeaveRequestCategory {
    id: number;
    name: string;
    requires_document?: boolean;
}

export interface LeaveRequestDecidedBy {
    id: number;
    first_name: string;
    last_name: string;
}

/** Row shape returned by `/leave/pagination-search` (LeaveRequestController). */
export interface LeaveRequests extends Record<string, unknown> {
    id: number;
    status: 'pending' | 'approved' | 'declined';
    trainee_id: number;
    batch_id: number;
    leave_category_id: number;
    leave_date: string;
    return_date: string;
    reason: string;
    document_path: string | null;
    document_original_name: string | null;
    document_mime_type: string | null;
    document_size: number | null;
    document_view_url: string | null;
    document_download_url: string | null;
    decision_remarks: string | null;
    decided_by_id: number | null;
    decided_at: string | null;
    created_at: string;
    updated_at: string;
    trainee?: LeaveRequestTrainee;
    batch?: LeaveRequestBatch;
    leave_category?: LeaveRequestCategory;
    decided_by?: LeaveRequestDecidedBy;
}

export const LEAVE_STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
];

const traineeName = (row: LeaveRequests) =>
    row.trainee ? `${row.trainee.first_name} ${row.trainee.last_name}` : '—';

export const columns: ColumnDef<LeaveRequests>[] = [
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        filterable: true,
        exactFilters: true,
        type: 'select',
        typeData: LEAVE_STATUS_OPTIONS,
    },
    {
        key: 'trainee_id',
        label: 'Trainee',
        render: (_value, row) => traineeName(row),
    },
    {
        key: 'leave_category_id',
        label: 'Category',
        render: (_value, row) => row.leave_category?.name ?? '—',
    },
    {
        key: 'leave_date',
        label: 'Duration',
        sortable: true,
        render: (_value, row) =>
            `${row.leave_date.slice(0, 10)} – ${row.return_date.slice(0, 10)}`,
    },
    {
        key: 'reason',
        label: 'Reason',
        searchable: true,
    },
];

/** Also used by the trainer read-only feed (batch column instead of actions). */
export const trainerColumns: ColumnDef<LeaveRequests>[] = [
    ...columns.slice(0, 1),
    {
        key: 'batch_id',
        label: 'Batch',
        render: (_value, row) => row.batch?.batch_code ?? '—',
    },
    ...columns.slice(1),
];

export const traineeColumns: ColumnDef<LeaveRequests>[] = columns.filter(
    (col) => col.key !== 'trainee_id',
);
