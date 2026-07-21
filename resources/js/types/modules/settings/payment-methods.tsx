import { Thumbnail } from '@/components/Thumbnail';
import type { ColumnDef } from '@/types/reusable/data-table';
import type { FieldDef } from '@/types/reusable/fields';
import { STATUS_FILTER_PAIRS } from '@/types/reusable/status';

export interface PaymentMethod extends Record<string, unknown> {
    id: number;
    status: string;
    provider_name: string;
    type: string;
    logo: string | null;
    qr_code: string | null;
    account_name: string | null;
    account_number: string | null;
    payment_link: string | null;
    instructions: string | null;
    display_order: number;
    created_at: string;
    updated_at: string;
}

const TYPE_OPTIONS = [
    { value: 'QR_CODE', label: 'QR Code' },
    { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
    { value: 'DIRECT_LINK', label: 'Direct Link' },
    { value: 'E_WALLET', label: 'E-Wallet' },
];

// ─── Columns: drives the card body, sort dropdown, and filter bar ───────────
export const columns: ColumnDef<PaymentMethod>[] = [
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
        key: 'logo',
        label: 'Logo',
        render: (value) => (
            <Thumbnail
                src={value as string}
                alt="Provider logo"
                className="h-10 w-10 rounded-lg border border-slate-200 object-cover"
                data-cy="payment-method-thumbnail"
            />
        ),
    },
    {
        key: 'provider_name',
        label: 'Provider',
        searchable: true,
        filterable: true,
    },
    {
        key: 'type',
        label: 'Type',
        type: 'select',
        filterable: true,
        typeData: TYPE_OPTIONS,
        render: (value) =>
            TYPE_OPTIONS.find((opt) => opt.value === value)?.label ??
            (value as string),
    },
    {
        key: 'account_number',
        label: 'Account No. / Phone',
        searchable: true,
    },
    {
        key: 'display_order',
        label: 'Order',
    },
];

// ─── Fields: drives the Create / Edit modal form ────────────────────────────
export const fields: FieldDef<PaymentMethod>[] = [
    {
        key: 'logo',
        label: 'Provider Logo',
        type: 'file',
        accept: 'image/*',
        maxSizeMB: 2,
        preview: true,
        dataCy: 'input-logo-upload',
        colSpan: 1,
    },
    {
        key: 'qr_code',
        label: 'QR Code',
        type: 'file',
        accept: 'image/*',
        maxSizeMB: 2,
        preview: true,
        dataCy: 'input-qr-image-upload',
        colSpan: 1,
    },
    {
        key: 'status',
        label: 'Status',
        type: 'select',
        options: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Archived' },
        ],
        defaultValue: 'active',
        colSpan: 2,
    },
    {
        key: 'provider_name',
        label: 'Provider Name',
        type: 'text',
        placeholder: 'GCash',
        required: true,
        dataCy: 'input-provider-name',
        colSpan: 2,
    },
    {
        key: 'type',
        label: 'Type',
        type: 'select',
        options: TYPE_OPTIONS,
        required: true,
        colSpan: 2,
    },
    {
        key: 'account_name',
        label: 'Account Name',
        type: 'text',
        placeholder: 'Juan Dela Cruz',
        colSpan: 2,
    },
    {
        key: 'account_number',
        label: 'Account Number / Phone',
        type: 'text',
        placeholder: '09171234567',
        dataCy: 'input-account-number',
        colSpan: 2,
    },
    {
        key: 'payment_link',
        label: 'Payment Link',
        type: 'url',
        placeholder: 'https://pay.example.com/...',
        colSpan: 2,
    },
    {
        key: 'instructions',
        label: 'Instructions',
        type: 'textarea',
        placeholder: 'Step-by-step instructions for the trainee',
        colSpan: 2,
    },
    {
        key: 'display_order',
        label: 'Sort Order',
        type: 'number',
        defaultValue: 0,
        colSpan: 2,
    },
];
