import { Pencil } from 'lucide-react'
import type { Trainee } from '@/types'
import { Button } from '@/components/Button'
import { StatCard } from '@/components/StatCard'
import { computePaymentBreakdown } from '@/data/mockData'
import { formatCurrency, PAYMENT_STATUS_STYLE } from './paymentsUtils'
import { cn } from '@/lib/utils'

export function PaymentInfoTab({ trainee, onEdit }: { trainee: Trainee; onEdit: () => void }) {
  const breakdown = computePaymentBreakdown(trainee)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Payment information</h3>
        <Button variant="secondary" size="sm" icon={Pencil} onClick={onEdit}>
          Edit payment info
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        <StatCard label="Total amount" value={formatCurrency(breakdown.totalAmount)} />
        <StatCard
          label="Discount"
          value={`${formatCurrency(breakdown.totalDiscountAmount)}`}
          hint={`${breakdown.discountPercentage}% discount rate`}
        />
        <StatCard label="Net amount due" value={formatCurrency(breakdown.netAmountDue)} />
        <StatCard label="Total amount paid" value={formatCurrency(breakdown.totalAmountPaid)} tone="success" />
        <StatCard
          label="Outstanding balance"
          value={formatCurrency(Math.max(0, breakdown.outstandingBalance))}
          tone={breakdown.outstandingBalance > 0 ? 'warning' : 'default'}
        />
        <div className="group rounded-lg border border-neutral-200 bg-white p-3.5">
          <span className="text-xs text-neutral-500">Payment status</span>
          <div className="mt-1.5">
            <span className={cn('inline-flex items-center rounded-pill px-2.5 py-1 text-xs font-medium', PAYMENT_STATUS_STYLE[breakdown.status])}>
              {breakdown.status}
            </span>
          </div>
        </div>
      </div>

      {trainee.paymentManuallyAdjusted && (
        <p className="mt-3 text-xs text-neutral-500">
          Totals were manually adjusted by {trainee.paymentAdjustedBy ?? 'an administrator'}
          {trainee.paymentAdjustedAt ? ` on ${trainee.paymentAdjustedAt}` : ''}.
        </p>
      )}
    </div>
  )
}
