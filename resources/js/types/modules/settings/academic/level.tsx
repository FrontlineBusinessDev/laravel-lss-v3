import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

export interface AcademicLevel extends Record<string, unknown> {
    id: number;
    status: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<AcademicLevel>[] = [
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
        label: 'Classification Name',
        searchable: true,
        filterable: true,
    },
    { key: 'created_at', label: 'Created At' },
];

export const fields: FieldDef<AcademicLevel>[] = [
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
        label: 'Classification Name',
        type: 'text',
        placeholder: 'College / Senior High School',
        required: true,
        colSpan: 2,
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Optional notes...',
        colSpan: 2,
    },
];
