import type { PaymentStatus } from './types';

export function formatCurrency(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}₱${Math.abs(amount).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  partially_paid: 'Partially paid',
  fully_paid: 'Fully paid',
  overpaid: 'Overpaid',
};

export const PAYMENT_STATUS_STYLE: Record<PaymentStatus, string> = {
  unpaid: 'bg-danger-50 text-danger-800',
  partially_paid: 'bg-warning-50 text-warning-800',
  fully_paid: 'bg-success-50 text-success-800',
  overpaid: 'bg-brand-50 text-brand-700',
};
