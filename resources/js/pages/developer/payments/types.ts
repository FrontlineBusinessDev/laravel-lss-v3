// Same shape the trainee-page Payment Details tab uses — one payment-record
// type, not two independently maintained copies that drift apart.
export type { AppTraineePayment as AppPaymentTransaction } from '@/types/modules/trainees/trainee-detail';
import type { AppTraineePayment } from '@/types/modules/trainees/trainee-detail';

export type PaymentStatus = 'unpaid' | 'partially_paid' | 'fully_paid' | 'overpaid';

export interface AppPaymentBatch {
  id: number;
  batch_code: string;
}

export interface AppPaymentSchool {
  id: number;
  school_name: string;
}

export interface AppPaymentRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  required_hours: string;
  gross_amount: string;
  total_discount_amount: string;
  net_amount_required: string;
  total_paid: string;
  outstanding_balance: string;
  payment_status: PaymentStatus;
  override_rate_per_hour: string | null;
  override_hours_discount_percent: string | null;
  override_group_discount_percent: string | null;
  applied_rate_per_hour: string;
  hours_discount_percent: string;
  group_discount_percent: string;
  batch: AppPaymentBatch | null;
  school: AppPaymentSchool | null;
  [key: string]: unknown;
}

export interface AppPaymentDetail extends AppPaymentRow {
  payments: AppTraineePayment[];
}

export function traineeFullName(row: { first_name: string; last_name: string }): string {
  return `${row.first_name} ${row.last_name}`.trim();
}
