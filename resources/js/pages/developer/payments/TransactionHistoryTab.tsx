import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { ConfirmDeleteModal } from '@/components/modal/ConfirmDeleteModal';
import { apiFetchJson } from '@/lib/apiFetch';
import { useToast } from '@/components/Toast';
import { formatCurrency } from './paymentsUtils';
import type { AppPaymentDetail, AppPaymentTransaction } from './types';

interface TransactionHistoryTabProps {
  detail: AppPaymentDetail;
  onAddPayment: () => void;
  onEditTransaction: (paymentId: number) => void;
  onDeleted: () => void;
}

export function TransactionHistoryTab({ detail, onAddPayment, onEditTransaction, onDeleted }: TransactionHistoryTabProps) {
  const { showToast } = useToast();
  const [deleteTarget, setDeleteTarget] = useState<AppPaymentTransaction | null>(null);
  const [deleting, setDeleting] = useState(false);
  const sorted = [...detail.payments].sort((a, b) => (a.payment_date < b.payment_date ? 1 : -1));

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetchJson(`/trainees/${detail.id}/payments/${deleteTarget.id}`, { method: 'DELETE' });
      showToast('Payment transaction deleted.', 'success');
      setDeleteTarget(null);
      onDeleted();
    } catch {
      showToast('Failed to delete payment transaction.', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div data-cy="transaction-history-tab-div-1">
      <div className="mb-3 flex items-center justify-between" data-cy="transaction-history-tab-div-2">
        <h3 className="text-sm font-semibold text-ink" data-cy="transaction-history-tab-h3-transaction-history">Transaction history</h3>
        <Button variant="primary" size="sm" icon={Plus} onClick={onAddPayment} data-cy="transaction-history-tab-button-add-payment">
          Record payment
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border border-neutral-200" data-cy="transaction-history-tab-div-5">
        <div className="overflow-x-auto lss-scrollbar" data-cy="transaction-history-tab-div-6">
          <table className="w-full min-w-[560px] border-collapse text-sm" data-cy="transaction-history-tab-table-7">
            <thead data-cy="transaction-history-tab-thead-8">
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="transaction-history-tab-tr-9">
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-date">Date</th>
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-reference">Reference no.</th>
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-amount-paid">Amount paid</th>
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-notes">Notes</th>
                <th className="px-3.5 py-2.5" data-cy="transaction-history-tab-th-actions" />
              </tr>
            </thead>
            <tbody data-cy="transaction-history-tab-tbody-18">
              {sorted.map((p) => (
                <tr key={p.id} className="border-t border-neutral-100" data-cy="transaction-history-tab-tr-19">
                  <td className="px-3.5 py-2.5 font-mono text-xs text-neutral-600" data-cy="transaction-history-tab-td-date">{p.payment_date}</td>
                  <td className="px-3.5 py-2.5 font-mono text-xs text-neutral-600" data-cy="transaction-history-tab-td-reference">{p.reference_no || '—'}</td>
                  <td className="px-3.5 py-2.5 font-medium text-ink" data-cy="transaction-history-tab-td-amount">{formatCurrency(Number(p.amount_paid))}</td>
                  <td className="max-w-[220px] truncate px-3.5 py-2.5 text-xs text-neutral-500" title={p.notes ?? undefined} data-cy="transaction-history-tab-td-notes">
                    {p.notes || '—'}
                  </td>
                  <td className="px-3.5 py-2.5 text-right" data-cy="transaction-history-tab-td-actions">
                    <div className="flex justify-end gap-0.5">
                      <TooltipIconButton icon={Pencil} label="Edit transaction" onClick={() => onEditTransaction(p.id)} data-cy="transaction-history-tab-tooltip-icon-button-edit" />
                      <TooltipIconButton icon={Trash2} label="Delete transaction" danger onClick={() => setDeleteTarget(p)} data-cy="transaction-history-tab-tooltip-icon-button-delete" />
                    </div>
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr data-cy="transaction-history-tab-tr-35">
                  <td colSpan={5} className="px-3.5 py-8 text-center text-sm text-neutral-500" data-cy="transaction-history-tab-td-no-payment-transactions-recorded-yet">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteModal
        open={deleteTarget !== null}
        busy={deleting}
        label={deleteTarget ? formatCurrency(Number(deleteTarget.amount_paid)) : undefined}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
