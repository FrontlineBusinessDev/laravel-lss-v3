import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

export interface AcademicProgramType extends Record<string, unknown> {
    id: number;
    status: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<AcademicProgramType>[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        searchable: true,
        filterable: true,
        typeData: STATUS_FILTER_PAIRS,
        exactFilters: true,
    },
    {
        key: 'name',
        label: 'Program',
        searchable: true,
        filterable: true,
    },
    { key: 'created_at', label: 'Created At' },
];

export const fields: FieldDef<AcademicProgramType>[] = [
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
        ],
        defaultValue: 'active',
    },
    {
        key: 'name',
        label: 'Program',
        type: 'text',
        placeholder: 'On The Job Training',
        required: true,
        colSpan: 2,
    },
];
