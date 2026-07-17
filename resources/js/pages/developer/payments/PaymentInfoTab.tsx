import { Pencil } from 'lucide-react';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/StatCard';
import { cn } from '@/lib/utils';
import { formatCurrency, PAYMENT_STATUS_LABEL, PAYMENT_STATUS_STYLE } from './paymentsUtils';
import type { AppPaymentDetail } from './types';

export function PaymentInfoTab({ detail, onEdit }: { detail: AppPaymentDetail; onEdit: () => void }) {
  const grossAmount = Number(detail.gross_amount);
  const totalDiscount = Number(detail.total_discount_amount);
  const netDue = Number(detail.net_amount_required);
  const totalPaid = Number(detail.total_paid);
  const outstanding = Math.max(0, Number(detail.outstanding_balance));

  return (
    <div data-cy="payment-info-tab-div-1">
      <div className="mb-3 flex items-center justify-between" data-cy="payment-info-tab-div-2">
        <h3 className="text-sm font-semibold text-ink" data-cy="payment-info-tab-h3-payment-information">Payment information</h3>
        <Button variant="secondary" size="sm" icon={Pencil} onClick={onEdit} data-cy="payment-info-tab-button-edit">
          Edit payment info
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3" data-cy="payment-info-tab-div-5">
        <StatCard label="Gross amount" value={formatCurrency(grossAmount)} data-cy="payment-info-tab-stat-card-gross-amount" />
        <StatCard label="Total discount" value={formatCurrency(totalDiscount)} data-cy="payment-info-tab-stat-card-discount" />
        <StatCard label="Net amount due" value={formatCurrency(netDue)} data-cy="payment-info-tab-stat-card-net-amount-due" />
        <StatCard label="Total amount paid" value={formatCurrency(totalPaid)} tone="success" data-cy="payment-info-tab-stat-card-total-amount-paid" />
        <StatCard label="Outstanding balance" value={formatCurrency(outstanding)} tone={outstanding > 0 ? 'warning' : 'default'} data-cy="payment-info-tab-stat-card-outstanding-balance" />
        <div className="group rounded-lg border border-neutral-200 bg-white p-3.5" data-cy="payment-info-tab-div-11">
          <span className="text-xs text-neutral-500" data-cy="payment-info-tab-span-payment-status">Payment status</span>
          <div className="mt-1.5" data-cy="payment-info-tab-div-13">
            <span className={cn('inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium', PAYMENT_STATUS_STYLE[detail.payment_status])} data-cy="payment-info-tab-span-14">
              {PAYMENT_STATUS_LABEL[detail.payment_status]}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600 lg:grid-cols-3" data-cy="payment-info-tab-div-billing-basis">
        <div data-cy="payment-info-tab-div-rate">
          Rate/hour: <span className="font-medium text-ink">{formatCurrency(Number(detail.applied_rate_per_hour))}</span>
          {detail.override_rate_per_hour != null && <span className="ml-1 text-neutral-400">(override)</span>}
        </div>
        <div data-cy="payment-info-tab-div-hours-discount">
          Hours discount: <span className="font-medium text-ink">{Number(detail.hours_discount_percent)}%</span>
          {detail.override_hours_discount_percent != null && <span className="ml-1 text-neutral-400">(override)</span>}
        </div>
        <div data-cy="payment-info-tab-div-group-discount">
          Group discount: <span className="font-medium text-ink">{Number(detail.group_discount_percent)}%</span>
          {detail.override_group_discount_percent != null && <span className="ml-1 text-neutral-400">(override)</span>}
        </div>
      </div>
    </div>
  );
}
