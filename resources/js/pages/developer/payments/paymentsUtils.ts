import type { PaymentStatus, Trainee } from '@/types'

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}\u20b1${Math.abs(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  Unpaid: 'bg-danger-50 text-danger-800',
  'Partially paid': 'bg-warning-50 text-warning-800',
  'Fully paid': 'bg-success-50 text-success-800',
  Overpaid: 'bg-brand-50 text-brand-700',
}

/** Generates the next sequential official receipt number, e.g. OR-2026-0201. */
export function nextReceiptNumber(allTrainees: Trainee[], year: number): string {
  const nums = allTrainees
    .flatMap((t) => t.payments)
    .map((p) => {
      const m = p.receiptNo.match(/OR-(\d{4})-(\d+)/)
      return m && Number(m[1]) === year ? Number(m[2]) : 0
    })
  const next = (nums.length ? Math.max(...nums) : 0) + 1
  return `OR-${year}-${String(next).padStart(4, '0')}`
}
