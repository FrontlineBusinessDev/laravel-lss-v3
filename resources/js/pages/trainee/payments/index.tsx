import { FileText } from 'lucide-react';
import { useState } from 'react';
import { AttachmentViewerModal } from '@/components/modal/AttachmentViewerModal';
import { StatCard } from '@/components/StatCard';
import DataTableCardField from '@/components/table/DataTableCardField';
import { formatCell } from '@/components/table/utils';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';
import type {
    PaymentMethod,
    TraineePaymentRow,
    TraineePaymentSummary,
} from '@/types/modules/payments/trainee-payment';
import { columns } from '@/types/modules/payments/trainee-payment';
import type { CardActions } from '@/types/reusable/card';
import { PaymentMethodSelector } from './PaymentMethodSelector';

const currency = (value: string | number) =>
    `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

interface Props {
    summary: TraineePaymentSummary;
    paymentMethods: PaymentMethod[];
}

export default function TraineePaymentsPage({
    summary,
    paymentMethods,
}: Props) {
    const [viewingReceipt, setViewingReceipt] =
        useState<TraineePaymentRow | null>(null);
    const outstanding = Number(summary.outstanding_balance);

    const renderRow = (row: TraineePaymentRow, actions: CardActions) => (
        <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
            {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                    {col.render
                        ? col.render(row[col.key], row)
                        : formatCell(row[col.key])}
                </td>
            ))}
            <td className="px-4 py-3 text-right whitespace-nowrap">
                {row.receipt_view_url ? (
                    <button
                        type="button"
                        onClick={() => setViewingReceipt(row)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
                    >
                        <FileText className="size-3.5" />
                        View receipt
                    </button>
                ) : (
                    <span className="text-xs text-neutral-400">
                        No receipt
                    </span>
                )}
            </td>
        </tr>
    );

    return (
        <TraineeLayout title="Payments">
            <div className="mb-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                <StatCard
                    label="Total amount due"
                    value={currency(summary.net_amount_required)}
                />
                <StatCard
                    label="Total payment received"
                    value={currency(summary.total_paid)}
                    tone="success"
                />
                <StatCard
                    label="Total discount"
                    value={currency(summary.total_discount_amount)}
                    tone="accent"
                />
                <StatCard
                    label="Outstanding balance"
                    value={currency(outstanding)}
                    tone={outstanding > 0 ? 'warning' : 'default'}
                />
            </div>

            <PaymentMethodSelector paymentMethods={paymentMethods} />

            <h2 className="mb-3 text-sm font-semibold text-ink">
                Payment transaction history
            </h2>
            <DataTableCardField<TraineePaymentRow>
                apiUrl="/trainee/payments"
                apiQueryKey="trainee-payments-own"
                columns={columns}
                defaultSortBy="payment_date"
                defaultSortDir="desc"
                renderCard={renderRow}
            />

            <AttachmentViewerModal
                attachment={
                    viewingReceipt?.receipt_view_url
                        ? {
                              id: viewingReceipt.id,
                              original_name:
                                  viewingReceipt.receipt_original_name ??
                                  'Receipt',
                              mime_type:
                                  viewingReceipt.receipt_mime_type ??
                                  'application/octet-stream',
                              file_size: viewingReceipt.receipt_size ?? 0,
                              view_url: viewingReceipt.receipt_view_url,
                              download_url:
                                  viewingReceipt.receipt_download_url ??
                                  viewingReceipt.receipt_view_url,
                          }
                        : null
                }
                onClose={() => setViewingReceipt(null)}
            />
        </TraineeLayout>
    );
}
