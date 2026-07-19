export type PaymentStatus = 'unpaid' | 'partially_paid' | 'fully_paid' | 'overpaid';

export interface AppPaymentTransaction {
  id: number;
  trainee_id: number;
  amount_paid: string;
  payment_date: string;
  reference_no: string | null;
  notes: string | null;
  created_at: string;
}

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
  payments: AppPaymentTransaction[];
}

export function traineeFullName(row: { first_name: string; last_name: string }): string {
  return `${row.first_name} ${row.last_name}`.trim();
}
