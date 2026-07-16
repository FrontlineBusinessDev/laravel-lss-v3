import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';

export interface HoursDiscount extends Record<string, unknown> {
    id: number;
    min_hours: number;
    discount_percentage: string;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<HoursDiscount>[] = [
    {
        key: 'min_hours',
        label: 'Min. Hours',
        sortable: true,
        searchable: true,
    },
    {
        key: 'discount_percentage',
        label: 'Discount %',
    },
];

export const fields: FieldDef<HoursDiscount>[] = [
    {
        key: 'min_hours',
        label: 'Min. Hours',
        type: 'number',
        placeholder: '120',
        required: true,
        colSpan: 2,
    },
    {
        key: 'discount_percentage',
        label: 'Discount %',
        type: 'number',
        placeholder: '2',
        required: true,
        colSpan: 2,
    },
];
