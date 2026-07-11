import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

export interface AcademicIndustry extends Record<string, unknown> {
    id: number;
    status: string;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<AcademicIndustry>[] = [
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
        label: 'Industry Name',
        searchable: true,
        filterable: true,
    },
    {
        key: 'description',
        label: 'Description',
        searchable: true,
    },
    { key: 'created_at', label: 'Created At' },
];

export const fields: FieldDef<AcademicIndustry>[] = [
    {
        key: 'status',
        label: 'Active',
        type: 'checkbox',
        defaultValue: true,
    },
    {
        key: 'name',
        label: 'Industry Name',
        type: 'text',
        placeholder: 'Information Technology',
        required: true,
        colSpan: 2,
    },
    {
        key: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Enter industry scope...',
        colSpan: 2,
    },
];
