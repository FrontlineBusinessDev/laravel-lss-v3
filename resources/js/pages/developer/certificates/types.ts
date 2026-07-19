export type CertificateAppliesTo = 'trainee' | 'seminar' | 'both';
export type CertificateStatus = 'active' | 'inactive';
export type CertificateType = 'trainee' | 'seminar' | 'citation';

export interface CertificateCitation {
  id: number;
  title: string;
  applies_to: CertificateAppliesTo;
  body_text: string;
  status: CertificateStatus;
  critical: boolean;
  created_by?: number | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export type TemplateElementType = 'text' | 'image' | 'qr' | 'line';
export type TemplateAlign = 'left' | 'center' | 'right';

export interface TemplateElement {
  id: string;
  type: TemplateElementType;
  token?: string;
  text?: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  align?: TemplateAlign;
  color?: string;
}

export interface CertificateTemplate {
  id: number;
  certificate_type: CertificateType;
  name: string;
  layout: TemplateElement[];
  page_size: 'a4' | 'letter';
  orientation: 'portrait' | 'landscape';
  is_default: boolean;
  status: CertificateStatus;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

interface IssuedCertificate {
  id: number;
  certificate_no: string;
  issued_at: string | null;
  citation?: { id: number; title: string } | null;
  template?: CertificateTemplate | null;
}

export interface TraineeCertificateRow {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  required_hours: string;
  completed_hours: string;
  batch?: { id: number; batch_code: string } | null;
  school?: { id: number; school_name: string } | null;
  certificate?: IssuedCertificate | null;
  [key: string]: unknown;
}

export interface SeminarCertificateRow {
  id: number;
  name: string;
  email: string;
  seminar?: { id: number; topic: string } | null;
  certificate?: IssuedCertificate | null;
  [key: string]: unknown;
}

export function traineeCertName(row: TraineeCertificateRow): string {
  return `${row.first_name} ${row.last_name}`.trim();
}

export type TraineeCertStatus = 'issued' | 'not_issued' | 'not_eligible';
export type SeminarCertStatus = 'issued' | 'not_issued';

export function traineeCertStatus(row: TraineeCertificateRow): TraineeCertStatus {
  if (row.certificate?.issued_at) return 'issued';
  if (Number(row.completed_hours) >= Number(row.required_hours)) return 'not_issued';
  return 'not_eligible';
}

export function seminarCertStatus(row: SeminarCertificateRow): SeminarCertStatus {
  return row.certificate?.issued_at ? 'issued' : 'not_issued';
}
