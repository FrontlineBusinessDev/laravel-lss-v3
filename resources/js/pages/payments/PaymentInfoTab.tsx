import { Pencil } from 'lucide-react';
import type { Trainee } from '@/types';
import { Button } from '@/components/Button';
import { StatCard } from '@/components/StatCard';
import { computePaymentBreakdown } from '@/data/mockData';
import { formatCurrency, PAYMENT_STATUS_STYLE } from './paymentsUtils';
import { cn } from '@/lib/utils';
export function PaymentInfoTab({
  trainee,
  onEdit
}: {
  trainee: Trainee;
  onEdit: () => void;
}) {
  const breakdown = computePaymentBreakdown(trainee);
  return <div data-cy="payment-info-tab-div-1">
      <div className="mb-3 flex items-center justify-between" data-cy="payment-info-tab-div-2">
        <h3 className="text-sm font-semibold text-ink" data-cy="payment-info-tab-h3-payment-information">Payment information</h3>
        <Button variant="secondary" size="sm" icon={Pencil} onClick={onEdit} data-cy="payment-info-tab-button-edit">
          Edit payment info
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3" data-cy="payment-info-tab-div-5">
        <StatCard label="Total amount" value={formatCurrency(breakdown.totalAmount)} data-cy="payment-info-tab-stat-card-total-amount" />
        <StatCard label="Discount" value={`${formatCurrency(breakdown.totalDiscountAmount)}`} hint={`${breakdown.discountPercentage}% discount rate`} data-cy="payment-info-tab-stat-card-discount" />
        <StatCard label="Net amount due" value={formatCurrency(breakdown.netAmountDue)} data-cy="payment-info-tab-stat-card-net-amount-due" />
        <StatCard label="Total amount paid" value={formatCurrency(breakdown.totalAmountPaid)} tone="success" data-cy="payment-info-tab-stat-card-total-amount-paid" />
        <StatCard label="Outstanding balance" value={formatCurrency(Math.max(0, breakdown.outstandingBalance))} tone={breakdown.outstandingBalance > 0 ? 'warning' : 'default'} data-cy="payment-info-tab-stat-card-outstanding-balance" />
        <div className="group rounded-lg border border-neutral-200 bg-white p-3.5" data-cy="payment-info-tab-div-11">
          <span className="text-xs text-neutral-500" data-cy="payment-info-tab-span-payment-status">Payment status</span>
          <div className="mt-1.5" data-cy="payment-info-tab-div-13">
            <span className={cn('inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium', PAYMENT_STATUS_STYLE[breakdown.status])} data-cy="payment-info-tab-span-14">
              {breakdown.status}
            </span>
          </div>
        </div>
      </div>

      {trainee.paymentManuallyAdjusted && <p className="mt-3 text-xs text-neutral-500" data-cy="payment-info-tab-p-totals-were-manually-adjusted-by">
          Totals were manually adjusted by {trainee.paymentAdjustedBy ?? 'an administrator'}
          {trainee.paymentAdjustedAt ? ` on ${trainee.paymentAdjustedAt}` : ''}.
        </p>}
    </div>;
}