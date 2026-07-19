import type { ColumnDef } from '@/types/reusable/data-table';

/** Row shape returned by `/trainee/payments/pagination-search`. */
export interface TraineePaymentRow extends Record<string, unknown> {
    id: number;
    trainee_id: number;
    amount_paid: string;
    payment_date: string;
    reference_no: string | null;
    notes: string | null;
    official_receipt_number: string | null;
    receipt_view_url: string | null;
    receipt_download_url: string | null;
    receipt_original_name: string | null;
    receipt_mime_type: string | null;
    receipt_size: number | null;
    created_at: string;
}

export interface TraineePaymentSummary {
    gross_amount: string;
    total_discount_amount: string;
    net_amount_required: string;
    total_paid: string;
    outstanding_balance: string;
}

const currency = (value: string | number) =>
    `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export const columns: ColumnDef<TraineePaymentRow>[] = [
    {
        key: 'payment_date',
        label: 'Date of payment',
        sortable: true,
        filterable: true,
        type: 'date-range',
    },
    {
        key: 'official_receipt_number',
        label: 'Official receipt no.',
        render: (value) => (value as string | null) ?? '—',
    },
    {
        key: 'amount_paid',
        label: 'Amount',
        sortable: true,
        render: (value) => currency(value as string),
    },
];
