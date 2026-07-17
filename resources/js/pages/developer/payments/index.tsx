import { useMemo, useState } from 'react';
import { Search, Eye, Plus, Pencil, Printer, X } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { RowMenu } from '@/components/RowMenu';
import { Button } from '@/components/Button';
import { useToast } from '@/components/Toast';
import { useBatches } from '@/context/BatchesContext';
import { cn } from '@/lib/utils';
import type { PaymentStatus, TraineePayment } from '@/types';
import { computePaymentBreakdown, currentUser, TODAY } from '@/data/mockData';
import { formatCurrency, PAYMENT_STATUS_STYLE } from './paymentsUtils';
import { PaymentDetailModal } from './PaymentDetailModal';
import { EditPaymentInfoModal } from './EditPaymentInfoModal';
import { TransactionModal, type TransactionFormValues } from './TransactionModal';
import { PaymentReportPrint } from './PaymentReportPrint';
const PAYMENT_STATUSES: PaymentStatus[] = ['Unpaid', 'Partially paid', 'Fully paid', 'Overpaid'];
export default function PaymentsPage() {
  const {
    showToast
  } = useToast();
  const {
    trainees,
    batches,
    updateTrainee
  } = useBatches();
  const [batchFilter, setBatchFilter] = useState('All batches');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [detailTraineeId, setDetailTraineeId] = useState<string | null>(null);
  const [editInfoTraineeId, setEditInfoTraineeId] = useState<string | null>(null);
  const [transactionModal, setTransactionModal] = useState<{
    mode: 'add' | 'edit';
    traineeId: string;
    editingTransaction: TraineePayment | null;
  } | null>(null);
  const [printTraineeId, setPrintTraineeId] = useState<string | null>(null);
  const batchOptions = ['All batches', ...batches.map(b => b.batchNo)];
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trainees.filter(t => !t.archived).filter(t => batchFilter === 'All batches' || t.batchNo === batchFilter).filter(t => !q || t.name.toLowerCase().includes(q) || t.school.toLowerCase().includes(q)).map(t => ({
      trainee: t,
      breakdown: computePaymentBreakdown(t)
    })).filter(r => statusFilter === 'All statuses' || r.breakdown.status === statusFilter).sort((a, b) => a.trainee.name.localeCompare(b.trainee.name));
  }, [trainees, batchFilter, query, statusFilter]);
  const detailTrainee = trainees.find(t => t.id === detailTraineeId) ?? null;
  const editInfoTrainee = trainees.find(t => t.id === editInfoTraineeId) ?? null;
  const transactionTrainee = transactionModal ? trainees.find(t => t.id === transactionModal.traineeId) ?? null : null;
  const printTrainee = trainees.find(t => t.id === printTraineeId) ?? null;
  function handleSavePaymentInfo(values: {
    totalAmount: number;
    discountPercentage: number;
  }) {
    if (!editInfoTraineeId) return;
    updateTrainee(editInfoTraineeId, {
      totalAmount: values.totalAmount,
      discountPercentage: values.discountPercentage,
      totalDiscountAmount: Math.round(values.totalAmount * values.discountPercentage / 100),
      paymentManuallyAdjusted: true,
      paymentAdjustedBy: currentUser.name,
      paymentAdjustedAt: TODAY.toISOString().slice(0, 10)
    });
    setEditInfoTraineeId(null);
    showToast('Payment information updated.', 'success');
  }
  function handleSaveTransaction(values: TransactionFormValues) {
    if (!transactionModal) return;
    const amount = Number(values.amount);
    if (!amount) return;
    const {
      mode,
      traineeId,
      editingTransaction
    } = transactionModal;
    const target = trainees.find(t => t.id === traineeId);
    if (!target) return;
    if (mode === 'add') {
      const newPayment: TraineePayment = {
        id: `pay-${Date.now()}`,
        date: values.date,
        amount,
        method: values.method,
        reference: values.reference || '\u2014',
        receiptNo: values.receiptNo,
        remarks: values.remarks || undefined,
        recordedBy: currentUser.name,
        invoiceLink: values.invoiceLink || undefined,
        acknowledgementReceiptLink: values.acknowledgementReceiptLink || undefined
      };
      updateTrainee(traineeId, {
        payments: [newPayment, ...target.payments]
      });
    } else {
      updateTrainee(traineeId, {
        payments: target.payments.map(p => p.id === editingTransaction?.id ? {
          ...p,
          date: values.date,
          amount,
          method: values.method,
          reference: values.reference || '\u2014',
          receiptNo: values.receiptNo,
          remarks: values.remarks || undefined,
          invoiceLink: values.invoiceLink || undefined,
          acknowledgementReceiptLink: values.acknowledgementReceiptLink || undefined
        } : p)
      });
    }
    setTransactionModal(null);
    showToast(mode === 'add' ? 'Payment transaction recorded.' : 'Payment transaction updated.', 'success');
  }
  const printGeneratedAt = new Date().toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  return <div data-cy="index-div-1">
      <div className="mb-4 no-print" data-cy="index-div-2">
        <h1 className="text-xl font-semibold text-ink" data-cy="index-h1-payments">Payments</h1>
        <p className="text-sm text-neutral-500" data-cy="index-p-select-a-batch-to-view-and">Select a batch to view and manage trainee payment records</p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3 no-print" data-cy="index-div-5">
        <div className="w-full sm:w-56" data-cy="index-div-6">
          <Dropdown options={batchOptions} value={batchFilter} onChange={setBatchFilter} data-cy="index-dropdown-set-batch-filter" />
        </div>
        <div className="relative w-full flex-1 sm:min-w-[200px]" data-cy="index-div-8">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" data-cy="index-search-9" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search trainee or school..." className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="index-input-search-trainee-or-school" />
        </div>
        <div className="w-full sm:w-44" data-cy="index-div-11">
          <Dropdown options={['All statuses', ...PAYMENT_STATUSES]} value={statusFilter} onChange={setStatusFilter} data-cy="index-dropdown-set-status-filter" />
        </div>
      </div>

      {batchFilter === 'All batches' && rows.length > 0 && <p className="mb-2 text-xs text-neutral-500 no-print" data-cy="index-p-showing-trainees-across-all-batches-select">
          Showing trainees across all batches. Select a specific batch above to narrow the list.
        </p>}

      <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white no-print sm:block" data-cy="index-div-14">
        <div className="overflow-x-auto lss-scrollbar" data-cy="index-div-15">
          <table className="w-full min-w-[960px] border-collapse text-sm" data-cy="index-table-16">
            <thead data-cy="index-thead-17">
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="index-tr-18">
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-trainee">Trainee</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-school">School</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-batch">Batch</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-net-amount-due">Net amount due</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-amount-paid">Amount paid</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-outstanding">Outstanding</th>
                <th className="px-4 py-2.5 font-medium" data-cy="index-th-status">Status</th>
                <th className="px-4 py-2.5 font-medium text-right" data-cy="index-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody data-cy="index-tbody-27">
              {rows.map(({
              trainee,
              breakdown
            }) => <tr key={trainee.id} className="border-t border-neutral-100 transition-colors hover:bg-neutral-50" data-cy="index-tr-28">
                  <td className="px-4 py-2.5 font-medium text-ink" data-cy="index-td-29">{trainee.name}</td>
                  <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-30">{trainee.school}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-31">{trainee.batchNo}</td>
                  <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-32">{formatCurrency(breakdown.netAmountDue)}</td>
                  <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-33">{formatCurrency(breakdown.totalAmountPaid)}</td>
                  <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-34">{formatCurrency(Math.max(0, breakdown.outstandingBalance))}</td>
                  <td className="px-4 py-2.5" data-cy="index-td-35">
                    <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', PAYMENT_STATUS_STYLE[breakdown.status])} data-cy="index-span-36">
                      {breakdown.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5" data-cy="index-td-37">
                    <div className="flex justify-end gap-0.5" data-cy="index-div-38">
                      <TooltipIconButton icon={Eye} label="View payment details" onClick={() => setDetailTraineeId(trainee.id)} data-cy="index-tooltip-icon-button-view-payment-details" />
                      <RowMenu actions={[{
                    label: 'Record payment',
                    icon: Plus,
                    onClick: () => setTransactionModal({
                      mode: 'add',
                      traineeId: trainee.id,
                      editingTransaction: null
                    })
                  }, {
                    label: 'Edit payment info',
                    icon: Pencil,
                    onClick: () => setEditInfoTraineeId(trainee.id)
                  }, {
                    label: 'Print payment report',
                    icon: Printer,
                    onClick: () => setPrintTraineeId(trainee.id)
                  }]} data-cy="index-row-menu-40" />
                    </div>
                  </td>
                </tr>)}
              {rows.length === 0 && <tr data-cy="index-tr-41">
                  <td colSpan={8} className="px-4 py-10 text-center text-xs text-neutral-400" data-cy="index-td-no-trainees-match-your-search-or">
                    No trainees match your search or filters.
                  </td>
                </tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col gap-2 no-print sm:hidden" data-cy="index-div-43">
        {rows.map(({
        trainee,
        breakdown
      }) => <div key={trainee.id} className="rounded-lg border border-neutral-200 bg-white p-3.5" data-cy="index-div-44">
            <div className="mb-1 flex items-start justify-between gap-2" data-cy="index-div-45">
              <button onClick={() => setDetailTraineeId(trainee.id)} className="min-w-0 flex-1 text-left" data-cy="index-button-set-detail-trainee-id">
                <p className="truncate text-sm font-semibold text-ink" data-cy="index-p-47">{trainee.name}</p>
                <p className="truncate text-xs text-neutral-500" data-cy="index-p-48">
                  {trainee.school} · {trainee.batchNo}
                </p>
              </button>
              <RowMenu actions={[{
            label: 'Record payment',
            icon: Plus,
            onClick: () => setTransactionModal({
              mode: 'add',
              traineeId: trainee.id,
              editingTransaction: null
            })
          }, {
            label: 'Edit payment info',
            icon: Pencil,
            onClick: () => setEditInfoTraineeId(trainee.id)
          }, {
            label: 'Print payment report',
            icon: Printer,
            onClick: () => setPrintTraineeId(trainee.id)
          }]} data-cy="index-row-menu-49" />
            </div>
            <div className="mt-2 flex items-center justify-between" data-cy="index-div-50">
              <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', PAYMENT_STATUS_STYLE[breakdown.status])} data-cy="index-span-51">
                {breakdown.status}
              </span>
              <span className="text-xs text-neutral-500" data-cy="index-span-outstanding">Outstanding: {formatCurrency(Math.max(0, breakdown.outstandingBalance))}</span>
            </div>
          </div>)}
        {rows.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400" data-cy="index-div-no-trainees-match-your-search-or">
            No trainees match your search or filters.
          </div>}
      </div>

      <PaymentDetailModal trainee={detailTrainee} onClose={() => setDetailTraineeId(null)} onEditPaymentInfo={() => detailTrainee && setEditInfoTraineeId(detailTrainee.id)} onAddPayment={() => detailTrainee && setTransactionModal({
      mode: 'add',
      traineeId: detailTrainee.id,
      editingTransaction: null
    })} onEditTransaction={transaction => detailTrainee && setTransactionModal({
      mode: 'edit',
      traineeId: detailTrainee.id,
      editingTransaction: transaction
    })} data-cy="index-payment-detail-modal-set-detail-trainee-id" />

      <EditPaymentInfoModal open={!!editInfoTrainee} trainee={editInfoTrainee} onClose={() => setEditInfoTraineeId(null)} onSave={handleSavePaymentInfo} data-cy="index-edit-payment-info-modal-set-edit-info-trainee-id" />

      <TransactionModal open={!!transactionModal} mode={transactionModal?.mode ?? 'add'} trainee={transactionTrainee} editingTransaction={transactionModal?.editingTransaction} onClose={() => setTransactionModal(null)} onSave={handleSaveTransaction} data-cy="index-transaction-modal-set-transaction-modal" />

      {/* Quick print (triggered from row menu, without opening the full detail modal) */}
      {printTrainee && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 animate-fadeIn no-print" onMouseDown={e => e.target === e.currentTarget && setPrintTraineeId(null)} data-cy="index-div-57">
          <div className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-lg bg-white p-6 shadow-modal animate-scaleIn lss-scrollbar" data-cy="index-div-58">
            <div className="mb-4 flex items-start justify-between gap-4" data-cy="index-div-59">
              <h2 className="text-lg font-semibold text-ink" data-cy="index-h2-print-preview">Print preview</h2>
              <button onClick={() => setPrintTraineeId(null)} aria-label="Close dialog" className="rounded-sm p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" data-cy="index-button-close-dialog">
                <X size={18} data-cy="index-x-62" />
              </button>
            </div>
            <PaymentReportPrint variant="preview" trainee={printTrainee} generatedAt={printGeneratedAt} data-cy="index-payment-report-print-63" />
            <div className="mt-4 flex justify-end gap-2" data-cy="index-div-64">
              <Button variant="secondary" icon={X} onClick={() => setPrintTraineeId(null)} data-cy="index-button-set-print-trainee-id">
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()} data-cy="index-button-66">
                Print
              </Button>
            </div>
          </div>
        </div>}
      {printTrainee && <PaymentReportPrint variant="print" trainee={printTrainee} generatedAt={printGeneratedAt} data-cy="index-payment-report-print-67" />}
    </div>;
}