import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Eye, Pencil, Plus, Printer, X } from 'lucide-react';
import { Button } from '@/components/Button';
import { RowMenu } from '@/components/RowMenu';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { DataTableCardField } from '@/components/table/DataTableCardField';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { ColumnDef } from '@/types/reusable/data-table';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import { formatCurrency, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_STYLE } from './paymentsUtils';
import { traineeFullName, type AppPaymentDetail, type AppPaymentRow } from './types';
import { PaymentDetailModal } from './PaymentDetailModal';
import { EditPaymentInfoModal } from './EditPaymentInfoModal';
import { TransactionModal } from './TransactionModal';
import { PaymentReportPrint } from './PaymentReportPrint';

const GRID = 'sm:grid sm:grid-cols-[1.6fr_1.3fr_1fr_1fr_1fr_1fr_1fr_2.5rem] sm:items-center sm:gap-3';

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'partially_paid', label: 'Partially paid' },
  { value: 'fully_paid', label: 'Fully paid' },
  { value: 'overpaid', label: 'Overpaid' },
];

const columns: ColumnDef<AppPaymentRow>[] = [
  { key: 'last_name', label: 'Trainee' },
  { key: 'school', label: 'School', sortable: false },
  { key: 'batch', label: 'Batch', sortable: false },
  { key: 'net_amount_required', label: 'Net amount due' },
  { key: 'total_paid', label: 'Amount paid', sortable: false },
  { key: 'outstanding_balance', label: 'Outstanding', sortable: false },
  { key: 'payment_status', label: 'Status', sortable: false },
  {
    key: 'batch_id',
    label: 'Batch',
    filterable: true,
    sortable: false,
    type: 'async-multi-select',
    loadOptions: (q) => loadLookupOptions('/batches', q, 'batch_code'),
  },
  {
    key: 'school_id',
    label: 'School',
    filterable: true,
    sortable: false,
    type: 'async-multi-select',
    loadOptions: (q) => loadLookupOptions('/settings/partner-schools', q, 'school_name'),
  },
];

const listHeader = (
  <div className={cn('hidden bg-neutral-50 px-4 py-2.5 text-left text-xs font-medium text-neutral-500', GRID)} data-cy="payments-index-list-header">
    <span>Trainee</span>
    <span>School</span>
    <span>Batch</span>
    <span>Net amount due</span>
    <span>Amount paid</span>
    <span>Outstanding</span>
    <span>Status</span>
    <span className="text-right">Actions</span>
  </div>
);

export default function PaymentsPage() {
  const [detailId, setDetailId] = useState<number | null>(null);
  const [editInfoId, setEditInfoId] = useState<number | null>(null);
  const [transactionModal, setTransactionModal] = useState<{ mode: 'add' | 'edit'; traineeId: number; paymentId: number | null } | null>(null);
  const [printId, setPrintId] = useState<number | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [refreshTable, setRefreshTable] = useState<() => void>(() => () => {});

  function handleMutated() {
    setRefreshToken((t) => t + 1);
    refreshTable();
  }

  function renderRow(row: AppPaymentRow) {
    const name = traineeFullName(row);
    const outstanding = Math.max(0, Number(row.outstanding_balance));
    return (
      <div className={cn('px-4 py-3 text-sm', GRID)} data-cy="payments-index-row">
        <button onClick={() => setDetailId(row.id)} className="min-w-0 text-left font-medium text-ink hover:underline" data-cy="payments-index-button-view-trainee">
          {name}
        </button>
        <span className="text-neutral-600">{row.school?.school_name ?? '—'}</span>
        <span className="font-mono text-xs text-neutral-600">{row.batch?.batch_code ?? '—'}</span>
        <span className="text-neutral-600">{formatCurrency(Number(row.net_amount_required))}</span>
        <span className="text-neutral-600">{formatCurrency(Number(row.total_paid))}</span>
        <span className="text-neutral-600">{formatCurrency(outstanding)}</span>
        <span>
          <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', PAYMENT_STATUS_STYLE[row.payment_status])}>
            {PAYMENT_STATUS_LABEL[row.payment_status]}
          </span>
        </span>
        <div className="flex justify-end gap-0.5">
          <TooltipIconButton icon={Eye} label="View payment details" onClick={() => setDetailId(row.id)} />
          <RowMenu
            actions={[
              {
                label: 'Record payment',
                icon: Plus,
                onClick: () => setTransactionModal({ mode: 'add', traineeId: row.id, paymentId: null }),
              },
              {
                label: 'Edit payment info',
                icon: Pencil,
                onClick: () => setEditInfoId(row.id),
              },
              {
                label: 'Print payment report',
                icon: Printer,
                onClick: () => setPrintId(row.id),
              },
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div data-cy="payments-index-div-1">
      <div className="mb-4 no-print" data-cy="payments-index-div-2">
        <h1 className="text-xl font-semibold text-ink" data-cy="payments-index-h1-payments">Payments</h1>
        <p className="text-sm text-neutral-500" data-cy="payments-index-p-subtitle">Search, filter, and manage trainee payment records</p>
      </div>

      <DataTableCardField<AppPaymentRow>
        apiUrl="/payments"
        apiQueryKey="payments"
        columns={columns}
        defaultSortBy="last_name"
        enableStatusFilter
        statusFilterOptions={STATUS_FILTER_OPTIONS}
        listHeader={listHeader}
        renderCard={(row) => renderRow(row)}
        onRefreshRef={(fn) => setRefreshTable(() => fn)}
      />

      <PaymentDetailModal
        traineeId={detailId}
        refreshToken={refreshToken}
        onClose={() => setDetailId(null)}
        onEditPaymentInfo={() => detailId && setEditInfoId(detailId)}
        onAddPayment={() => detailId && setTransactionModal({ mode: 'add', traineeId: detailId, paymentId: null })}
        onEditTransaction={(paymentId) => detailId && setTransactionModal({ mode: 'edit', traineeId: detailId, paymentId })}
        onMutated={handleMutated}
      />

      <EditPaymentInfoModal open={editInfoId != null} traineeId={editInfoId} onClose={() => setEditInfoId(null)} onSaved={handleMutated} />

      <TransactionModal
        open={!!transactionModal}
        mode={transactionModal?.mode ?? 'add'}
        traineeId={transactionModal?.traineeId ?? null}
        paymentId={transactionModal?.paymentId ?? null}
        onClose={() => setTransactionModal(null)}
        onSaved={handleMutated}
      />

      {printId != null && (
        <PaymentPrintOverlay traineeId={printId} onClose={() => setPrintId(null)} />
      )}
    </div>
  );
}

/** Quick-print row action: fetches the trainee's payment detail directly, without opening the full detail modal. */
function PaymentPrintOverlay({ traineeId, onClose }: { traineeId: number; onClose: () => void }) {
  const [detail, setDetail] = useState<AppPaymentDetail | null>(null);

  useEffect(() => {
    let active = true;
    apiFetchJson<AppPaymentDetail>(`/payments/${traineeId}`).then((res) => {
      if (active) setDetail(res.data);
    });
    return () => {
      active = false;
    };
  }, [traineeId]);

  if (!detail) return null;
  const generatedAt = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4 animate-fadeIn no-print"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        data-cy="payments-index-print-overlay"
      >
        <div className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-lg bg-white p-6 shadow-modal animate-scaleIn lss-scrollbar">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="text-lg font-semibold text-ink">Print preview</h2>
            <button onClick={onClose} aria-label="Close dialog" className="rounded-sm p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600">
              <X size={18} />
            </button>
          </div>
          <PaymentReportPrint variant="preview" detail={detail} generatedAt={generatedAt} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" icon={X} onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" icon={Printer} onClick={() => window.print()}>
              Print
            </Button>
          </div>
        </div>
      </div>
      <PaymentReportPrint variant="print" detail={detail} generatedAt={generatedAt} />
    </>,
    document.body,
  );
}
