import { router } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { traineePaymentsService } from '@/api-service-layer/admin/trainee';
import { ApiError } from '@/api-service-layer/client';
import { Button } from '@/components/Button';
import { AttachmentViewerModal } from '@/components/modal/AttachmentViewerModal';
import { StatCard } from '@/components/StatCard';
import { useToast } from '@/components/Toast';
import { BillingOverridePanel } from '@/components/trainees/BillingOverridePanel';
import { PaymentTransactionModal } from '@/components/trainees/PaymentTransactionModal';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';
import { formatDateTime } from '@/lib/date';
import type {
    AppTraineePayment,
    TraineeDetail,
} from '@/types/modules/trainees/trainee-detail';

const currency = (value: string | number) =>
    `₱${Number(value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

export default function PaymentDetailsTab({
    trainee,
}: {
    trainee: TraineeDetail;
}) {
    const { showToast } = useToast();
    const [transactionModal, setTransactionModal] = useState<{
        mode: 'add' | 'edit';
        payment: AppTraineePayment | null;
    } | null>(null);
    const [viewingReceipt, setViewingReceipt] =
        useState<AppTraineePayment | null>(null);

    const deletePayment = async (paymentId: number) => {
        try {
            await traineePaymentsService.destroy(trainee.id, paymentId);
            showToast('Payment removed', 'success');
            router.reload({ only: ['trainee'] });
        } catch (error) {
            showToast(
                error instanceof ApiError
                    ? error.message
                    : 'Failed to remove payment',
                'error',
            );
        }
    };

    const outstanding = Number(trainee.outstanding_balance);

    return (
        <TraineesDetailLayout trainee={trainee}>
            <div
                className="flex flex-col gap-4"
                data-cy="payment-details-tab-div-1"
            >
                <div
                    className="rounded-lg border border-neutral-200 bg-white p-5"
                    data-cy="payment-details-tab-div-stats-wrapper"
                >
                    <div
                        className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-5"
                        data-cy="payment-details-tab-div-2"
                    >
                        <StatCard
                            label="Gross amount"
                            value={currency(trainee.gross_amount)}
                            data-cy="payment-details-tab-stat-card-gross-amount"
                        />
                        <StatCard
                            label="Total discount"
                            value={currency(trainee.total_discount_amount)}
                            data-cy="payment-details-tab-stat-card-discount"
                        />
                        <StatCard
                            label="Net amount required"
                            value={currency(trainee.net_amount_required)}
                            data-cy="payment-details-tab-stat-card-net-amount"
                        />
                        <StatCard
                            label="Total paid"
                            value={currency(trainee.total_paid)}
                            tone="success"
                            data-cy="payment-details-tab-stat-card-total-paid"
                        />
                        <StatCard
                            label="Outstanding balance"
                            value={currency(outstanding)}
                            tone={outstanding > 0 ? 'warning' : 'default'}
                            data-cy="payment-details-tab-stat-card-outstanding-balance"
                        />
                    </div>

                    <div
                        className="mb-3 flex items-center justify-between"
                        data-cy="payment-details-tab-div-8"
                    >
                        <h3
                            className="text-sm font-semibold text-ink"
                            data-cy="payment-details-tab-h3-payment-history"
                        >
                            Payment history
                        </h3>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={Plus}
                            onClick={() =>
                                setTransactionModal({
                                    mode: 'add',
                                    payment: null,
                                })
                            }
                            data-cy="payment-details-tab-button-set-modal-open"
                        >
                            Record payment
                        </Button>
                    </div>

                    <div
                        className="overflow-hidden rounded-md border border-neutral-200"
                        data-cy="payment-details-tab-div-11"
                    >
                        <div
                            className="lss-scrollbar overflow-x-auto"
                            data-cy="payment-details-tab-div-12"
                        >
                            <table
                                className="w-full min-w-[560px] border-collapse text-sm"
                                data-cy="payment-details-tab-table-13"
                            >
                                <thead data-cy="payment-details-tab-thead-14">
                                    <tr
                                        className="bg-neutral-50 text-left text-xs font-medium text-neutral-500"
                                        data-cy="payment-details-tab-tr-15"
                                    >
                                        <th
                                            className="px-3.5 py-2.5 font-medium"
                                            data-cy="payment-details-tab-th-date"
                                        >
                                            Date
                                        </th>
                                        <th
                                            className="px-3.5 py-2.5 font-medium"
                                            data-cy="payment-details-tab-th-amount"
                                        >
                                            Amount
                                        </th>
                                        <th
                                            className="px-3.5 py-2.5 font-medium"
                                            data-cy="payment-details-tab-th-reference"
                                        >
                                            Reference
                                        </th>
                                        <th
                                            className="px-3.5 py-2.5 font-medium"
                                            data-cy="payment-details-tab-th-reference-link"
                                        >
                                            Reference link
                                        </th>
                                        <th
                                            className="px-3.5 py-2.5 font-medium"
                                            data-cy="payment-details-tab-th-notes"
                                        >
                                            Notes
                                        </th>
                                        <th
                                            className="px-3.5 py-2.5 font-medium"
                                            data-cy="payment-details-tab-th-receipt"
                                        >
                                            Receipt
                                        </th>
                                        <th
                                            className="px-3.5 py-2.5 font-medium"
                                            data-cy="payment-details-tab-th-actions"
                                        />
                                    </tr>
                                </thead>
                                <tbody data-cy="payment-details-tab-tbody-21">
                                    {trainee.payments.map((p) => (
                                        <tr
                                            key={p.id}
                                            className="border-t border-neutral-100"
                                            data-cy="payment-details-tab-tr-22"
                                        >
                                            <td
                                                className="px-3.5 py-2.5 text-neutral-600"
                                                data-cy="payment-details-tab-td-23"
                                            >
                                                {formatDateTime(p.payment_date)}
                                            </td>
                                            <td
                                                className="px-3.5 py-2.5 text-right font-medium text-ink"
                                                data-cy="payment-details-tab-td-24"
                                            >
                                                {currency(p.amount_paid)}
                                            </td>
                                            <td
                                                className="px-3.5 py-2.5 font-mono text-xs text-neutral-600"
                                                data-cy="payment-details-tab-td-26"
                                            >
                                                {p.reference_no ?? '—'}
                                            </td>
                                            <td
                                                className="px-3.5 py-2.5 text-xs"
                                                data-cy="payment-details-tab-td-reference-link"
                                            >
                                                {p.receipt_link ? (
                                                    <a
                                                        href={p.receipt_link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="font-medium text-brand-600 hover:underline"
                                                    >
                                                        Open link
                                                    </a>
                                                ) : (
                                                    <span className="text-neutral-400">
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className="max-w-[200px] truncate px-3.5 py-2.5 text-neutral-600"
                                                title={p.notes ?? undefined}
                                                data-cy="payment-details-tab-td-notes"
                                            >
                                                {p.notes ?? '—'}
                                            </td>
                                            <td
                                                className="px-3.5 py-2.5 text-neutral-600"
                                                data-cy="payment-details-tab-td-receipt"
                                            >
                                                {p.receipt_view_url ? (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setViewingReceipt(p)
                                                        }
                                                        className="text-xs font-medium text-brand-600 hover:underline"
                                                        data-cy="payment-details-tab-button-view-receipt"
                                                    >
                                                        {p.official_receipt_number ??
                                                            'View'}
                                                    </button>
                                                ) : (
                                                    '—'
                                                )}
                                            </td>
                                            <td
                                                className="px-3.5 py-2.5 text-right"
                                                data-cy="payment-details-tab-td-27"
                                            >
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() =>
                                                            setTransactionModal({
                                                                mode: 'edit',
                                                                payment: p,
                                                            })
                                                        }
                                                        className="text-xs font-medium text-brand-600 transition-colors hover:underline"
                                                        data-cy="payment-details-tab-button-edit-payment"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            deletePayment(p.id)
                                                        }
                                                        className="hover:text-danger-700 text-xs font-medium text-danger-600 transition-colors"
                                                        data-cy="payment-details-tab-button-delete-payment"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {trainee.payments.length === 0 && (
                                        <tr data-cy="payment-details-tab-tr-30">
                                            <td
                                                colSpan={7}
                                                className="px-3.5 py-8 text-center text-sm text-neutral-500"
                                                data-cy="payment-details-tab-td-no-payment-transactions-recorded-yet"
                                            >
                                                No payment transactions recorded
                                                yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <BillingOverridePanel trainee={trainee} />

                <PaymentTransactionModal
                    open={transactionModal !== null}
                    mode={transactionModal?.mode ?? 'add'}
                    traineeId={trainee.id}
                    traineeName={`${trainee.first_name} ${trainee.last_name}`.trim()}
                    outstandingBalance={outstanding}
                    payment={transactionModal?.payment ?? null}
                    onClose={() => setTransactionModal(null)}
                    onSaved={() => router.reload({ only: ['trainee'] })}
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
            </div>
        </TraineesDetailLayout>
    );
}
