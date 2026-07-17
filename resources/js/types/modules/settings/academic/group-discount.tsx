import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';

export interface GroupDiscount extends Record<string, unknown> {
    id: number;
    min_trainees: number;
    discount_percentage: string;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<GroupDiscount>[] = [
    {
        key: 'min_trainees',
        label: 'Min. Trainees',
        sortable: true,
        searchable: true,
    },
    {
        key: 'discount_percentage',
        label: 'Discount %',
    },
];

export const fields: FieldDef<GroupDiscount>[] = [
    {
        key: 'min_trainees',
        label: 'Min. Trainees',
        type: 'number',
        placeholder: '3',
        required: true,
        colSpan: 2,
    },
    {
        key: 'discount_percentage',
        label: 'Discount %',
        type: 'number',
        placeholder: '3',
        required: true,
        colSpan: 2,
    },
];
