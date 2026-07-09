import { ColumnDef } from '@/types/reusable/data-table';
import { FieldDef } from '@/types/reusable/fields';

export interface AppBatches extends Record<string, unknown> {
    id: number;
    batch_code: string;
    public_url_id: string;
    date_started: string;
    setup: 'f2f' | 'online';
    academic_industry_id: number;
    academic_level_id: number;
    academic_program_id: number;
    created_at: string;
    updated_at: string;
}

export const columns: ColumnDef<AppBatches>[] = [
    {
        key: 'batch_code',
        label: 'Batch Code',
        searchable: true,
        filterable: true,
    },
    {
        key: 'setup',
        label: 'Setup Mode',
        filterable: true,
        render: (value) => (
            <span
                className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                    value === 'f2f'
                        ? 'bg-green-50 text-green-700 ring-green-600/20'
                        : 'bg-blue-50 text-blue-700 ring-blue-600/20'
                }`}
            >
                {(value as string).toUpperCase()}
            </span>
        ),
    },
    {
        key: 'date_started',
        label: 'Date Started',
    },
    { key: 'created_at', label: 'Created' },
];

export const fields: FieldDef<AppBatches>[] = [
    {
        key: 'batch_code',
        label: 'Batch Identification Code',
        type: 'text',
        placeholder: 'WD-2026-B1',
        required: true,
        colSpan: 2,
    },
    {
        key: 'public_url_id',
        label: 'Public URL Token ID',
        type: 'text',
        placeholder: 'unique-uuid-token',
        required: true,
        colSpan: 2,
    },
    {
        key: 'date_started',
        label: 'Start Date',
        type: 'date',
        required: true,
        colSpan: 2,
    },
    {
        key: 'setup',
        label: 'Training Delivery Format',
        type: 'select',
        required: true,
        options: [
            { label: 'Face to Face (F2F)', value: 'f2f' },
            { label: 'Online Remote', value: 'online' },
        ],
        colSpan: 2,
    },
    {
        key: 'academic_industry_id',
        label: 'Associated Industry Track',
        type: 'select',
        required: true,
        colSpan: 2,
    },
    {
        key: 'academic_level_id',
        label: 'Academic Year Level Bracket',
        type: 'select',
        required: true,
        colSpan: 2,
    },
    {
        key: 'academic_program_id',
        label: 'Target Program Blueprint',
        type: 'select',
        required: true,
        colSpan: 2,
    },
];
