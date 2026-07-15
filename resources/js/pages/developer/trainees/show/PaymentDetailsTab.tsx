import { useMemo, useState } from 'react';
import { Plus, Receipt } from 'lucide-react';
import type { Trainee, TraineePayment } from '@/types';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { TextField, SelectField } from '@/components/FormField';
import { StatCard } from '@/components/StatCard';
import TraineesDetailLayout from '@/layouts/trainees/TraineesDetailLayout';

export default function PaymentDetailsTab({ trainee }: { trainee: Trainee }) {
    const [payments, setPayments] = useState<TraineePayment[]>(
        trainee.payments ?? [{ amount: 0 }],
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({
        amount: '',
        method: 'Bank transfer',
        reference: '',
    });
    const amountDue = trainee?.totalAmount - trainee?.totalDiscountAmount;
    const amountPaid = useMemo(
        () => payments?.reduce((sum, p) => sum + p.amount, 0),
        [payments],
    );
    const outstanding = Math.max(0, amountDue - amountPaid);
    const currency = (n: number) =>
        `₱${n?.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
        })}`;
    const handleRecord = () => {
        const amount = Number(form?.amount ?? 0);
        if (!amount) return;
        setPayments((prev) => [
            ...prev,
            {
                id: `pay-${prev.length + 1}-${Date.now()}`,
                date: new Date().toISOString().slice(0, 10),
                amount,
                method: form.method,
                reference: form.reference || '—',
                receiptNo: `OR-${new Date().getFullYear()}-${String(prev.length + 1).padStart(4, '0')}`,
                recordedBy: 'Thea Ramirez',
            },
        ]);
        setForm({
            amount: '',
            method: 'Bank transfer',
            reference: '',
        });
        setModalOpen(false);
    };
    return (
        <>
            <TraineesDetailLayout trainee={trainee}>
                <div
                    className="rounded-lg border border-neutral-200 bg-white p-5"
                    data-cy="payment-details-tab-div-1"
                >
                    <div
                        className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-5"
                        data-cy="payment-details-tab-div-2"
                    >
                        <StatCard
                            label="Total amount"
                            value={currency(trainee?.totalAmount ?? 0)}
                            data-cy="payment-details-tab-stat-card-total-amount"
                        />
                        <StatCard
                            label="Discount"
                            value={`${currency(trainee?.totalDiscountAmount ?? 0)} (${trainee?.discountPercentage ?? 0}%)`}
                            data-cy="payment-details-tab-stat-card-discount"
                        />
                        <StatCard
                            label="Amount due"
                            value={currency(amountDue ?? 0)}
                            data-cy="payment-details-tab-stat-card-amount-due"
                        />
                        <StatCard
                            label="Amount paid"
                            value={currency(amountPaid)}
                            tone="success"
                            data-cy="payment-details-tab-stat-card-amount-paid"
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
                            onClick={() => setModalOpen(true)}
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
                                            data-cy="payment-details-tab-th-method"
                                        >
                                            Method
                                        </th>
                                        <th
                                            className="px-3.5 py-2.5 font-medium"
                                            data-cy="payment-details-tab-th-reference"
                                        >
                                            Reference
                                        </th>
                                        <th
                                            className="px-3.5 py-2.5 font-medium"
                                            data-cy="payment-details-tab-th-receipt-no"
                                        >
                                            Receipt no.
                                        </th>
                                    </tr>
                                </thead>
                                <tbody data-cy="payment-details-tab-tbody-21">
                                    {payments.map((p, key) => (
                                        <tr
                                            key={p.id ?? key}
                                            className="border-t border-neutral-100"
                                            data-cy="payment-details-tab-tr-22"
                                        >
                                            <td
                                                className="px-3.5 py-2.5 text-neutral-600"
                                                data-cy="payment-details-tab-td-23"
                                            >
                                                {p.date}
                                            </td>
                                            <td
                                                className="px-3.5 py-2.5 font-medium text-ink"
                                                data-cy="payment-details-tab-td-24"
                                            >
                                                {currency(p.amount)}
                                            </td>
                                            <td
                                                className="px-3.5 py-2.5 text-neutral-600"
                                                data-cy="payment-details-tab-td-25"
                                            >
                                                {p.method}
                                            </td>
                                            <td
                                                className="px-3.5 py-2.5 font-mono text-xs text-neutral-600"
                                                data-cy="payment-details-tab-td-26"
                                            >
                                                {p.reference}
                                            </td>
                                            <td
                                                className="px-3.5 py-2.5"
                                                data-cy="payment-details-tab-td-27"
                                            >
                                                <button
                                                    className="flex items-center gap-1.5 text-xs font-medium text-brand-500 transition-colors hover:text-brand-600"
                                                    data-cy="payment-details-tab-button-28"
                                                >
                                                    <Receipt
                                                        size={13}
                                                        data-cy="payment-details-tab-receipt-29"
                                                    />
                                                    {p.receiptNo}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && (
                                        <tr data-cy="payment-details-tab-tr-30">
                                            <td
                                                colSpan={5}
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

                    <Modal
                        open={modalOpen}
                        onClose={() => setModalOpen(false)}
                        title="Record payment"
                        description="Log a new payment transaction for this trainee."
                        data-cy="payment-details-tab-modal-record-payment"
                    >
                        <TextField
                            label="Amount"
                            type="number"
                            min={0}
                            value={form.amount}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    amount: e.target.value,
                                }))
                            }
                            placeholder="0.00"
                            data-cy="payment-details-tab-text-field-amount"
                        />
                        <SelectField
                            label="Payment method"
                            options={[
                                'Bank transfer',
                                'GCash',
                                'Cash',
                                'Credit card',
                                'Check',
                            ]}
                            value={form.method}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    method: e.target.value,
                                }))
                            }
                            data-cy="payment-details-tab-select-field-payment-method"
                        />
                        <TextField
                            label="Reference no."
                            optional
                            value={form.reference}
                            onChange={(e) =>
                                setForm((f) => ({
                                    ...f,
                                    reference: e.target.value,
                                }))
                            }
                            placeholder="e.g. REF-12345"
                            data-cy="payment-details-tab-text-field-reference-no"
                        />
                        <div
                            className="flex justify-end gap-2 pt-1"
                            data-cy="payment-details-tab-div-36"
                        >
                            <Button
                                variant="secondary"
                                onClick={() => setModalOpen(false)}
                                data-cy="payment-details-tab-button-set-modal-open-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleRecord}
                                data-cy="payment-details-tab-button-record"
                            >
                                Save payment
                            </Button>
                        </div>
                    </Modal>
                </div>
            </TraineesDetailLayout>
        </>
    );
}
