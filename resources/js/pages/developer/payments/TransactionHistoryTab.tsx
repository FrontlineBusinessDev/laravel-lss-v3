import { FileText, FileCheck2, Pencil, Plus } from 'lucide-react';
import type { Trainee, TraineePayment } from '@/types';
import { Button } from '@/components/Button';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { formatCurrency } from './paymentsUtils';
interface TransactionHistoryTabProps {
  trainee: Trainee;
  onAddPayment: () => void;
  onEditTransaction: (transaction: TraineePayment) => void;
}
export function TransactionHistoryTab({
  trainee,
  onAddPayment,
  onEditTransaction
}: TransactionHistoryTabProps) {
  const sorted = [...trainee.payments].sort((a, b) => a.date < b.date ? 1 : -1);
  return <div data-cy="transaction-history-tab-div-1">
      <div className="mb-3 flex items-center justify-between" data-cy="transaction-history-tab-div-2">
        <h3 className="text-sm font-semibold text-ink" data-cy="transaction-history-tab-h3-transaction-history">Transaction history</h3>
        <Button variant="primary" size="sm" icon={Plus} onClick={onAddPayment} data-cy="transaction-history-tab-button-add-payment">
          Record payment
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border border-neutral-200" data-cy="transaction-history-tab-div-5">
        <div className="overflow-x-auto lss-scrollbar" data-cy="transaction-history-tab-div-6">
          <table className="w-full min-w-[720px] border-collapse text-sm" data-cy="transaction-history-tab-table-7">
            <thead data-cy="transaction-history-tab-thead-8">
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="transaction-history-tab-tr-9">
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-date">Date</th>
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-or-no">OR no.</th>
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-amount-paid">Amount paid</th>
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-method">Method</th>
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-remarks">Remarks</th>
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-recorded-by">Recorded by</th>
                <th className="px-3.5 py-2.5 font-medium" data-cy="transaction-history-tab-th-documents">Documents</th>
                <th className="px-3.5 py-2.5" data-cy="transaction-history-tab-th-17" />
              </tr>
            </thead>
            <tbody data-cy="transaction-history-tab-tbody-18">
              {sorted.map(p => <tr key={p.id} className="border-t border-neutral-100" data-cy="transaction-history-tab-tr-19">
                  <td className="px-3.5 py-2.5 font-mono text-xs text-neutral-600" data-cy="transaction-history-tab-td-20">{p.date}</td>
                  <td className="px-3.5 py-2.5 font-mono text-xs text-neutral-600" data-cy="transaction-history-tab-td-21">{p.receiptNo}</td>
                  <td className="px-3.5 py-2.5 font-medium text-ink" data-cy="transaction-history-tab-td-22">{formatCurrency(p.amount)}</td>
                  <td className="px-3.5 py-2.5 text-neutral-600" data-cy="transaction-history-tab-td-23">{p.method}</td>
                  <td className="px-3.5 py-2.5 max-w-[160px] truncate text-xs text-neutral-500" title={p.remarks} data-cy="transaction-history-tab-td-p-remarks">
                    {p.remarks || '\u2014'}
                  </td>
                  <td className="px-3.5 py-2.5 text-xs text-neutral-500" data-cy="transaction-history-tab-td-25">{p.recordedBy}</td>
                  <td className="px-3.5 py-2.5" data-cy="transaction-history-tab-td-26">
                    <div className="flex items-center gap-1" data-cy="transaction-history-tab-div-27">
                      {p.invoiceLink ? <a href={p.invoiceLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-brand-500 transition-colors hover:bg-brand-50 hover:text-brand-600" title="View service invoice" data-cy="transaction-history-tab-a-view-service-invoice">
                          <FileText size={13} data-cy="transaction-history-tab-file-text-29" /> Invoice
                        </a> : <span className="text-xs text-neutral-400" data-cy="transaction-history-tab-span-no-invoice">No invoice</span>}
                      {p.acknowledgementReceiptLink ? <a href={p.acknowledgementReceiptLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-brand-500 transition-colors hover:bg-brand-50 hover:text-brand-600" title="View acknowledgement receipt" data-cy="transaction-history-tab-a-view-acknowledgement-receipt">
                          <FileCheck2 size={13} data-cy="transaction-history-tab-file-check2-32" /> A/R
                        </a> : null}
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-right" data-cy="transaction-history-tab-td-33">
                    <TooltipIconButton icon={Pencil} label="Edit transaction / attachments" onClick={() => onEditTransaction(p)} data-cy="transaction-history-tab-tooltip-icon-button-edit-transaction-attachments" />
                  </td>
                </tr>)}
              {sorted.length === 0 && <tr data-cy="transaction-history-tab-tr-35">
                  <td colSpan={8} className="px-3.5 py-8 text-center text-sm text-neutral-500" data-cy="transaction-history-tab-td-no-payment-transactions-recorded-yet">
                    No payment transactions recorded yet.
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}