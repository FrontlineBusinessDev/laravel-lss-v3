import type { ColumnDef } from '@/types/reusable/data-table';
import type { FieldDef } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

/** Row shape returned by `/settings/leave-categories` (crudModule). */
export interface LeaveCategories extends Record<string, unknown> {
    id: number;
    status: string;
    name: string;
    max_days: number | null;
    max_instances: number | null;
    requires_document: boolean;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<LeaveCategories>[] = [
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
        key: 'name',
        label: 'Category',
        searchable: true,
        sortable: true,
        filterable: true,
    },
    {
        key: 'max_days',
        label: 'Max days',
        sortable: true,
        render: (value) => (value == null ? 'Unlimited' : String(value)),
    },
    {
        key: 'max_instances',
        label: 'Max instances',
        sortable: true,
        render: (value) => (value == null ? 'Unlimited' : String(value)),
    },
    {
        key: 'requires_document',
        label: 'Document required',
        render: (value) => (value ? 'Yes' : 'No'),
    },
];

export const fields: FieldDef<LeaveCategories>[] = [
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
        key: 'name',
        label: 'Category name',
        type: 'text',
        required: true,
        colSpan: 2,
    },
    {
        key: 'max_days',
        label: 'Max days per period',
        type: 'number',
        helpText: 'Leave blank for unlimited.',
    },
    {
        key: 'max_instances',
        label: 'Max applications per period',
        type: 'number',
        helpText: 'Leave blank for unlimited.',
    },
    {
        key: 'requires_document',
        label: 'Requires supporting document',
        type: 'checkbox',
        helpText:
            'When enabled, trainees must attach a supporting document to submit this leave type.',
        colSpan: 2,
    },
];
