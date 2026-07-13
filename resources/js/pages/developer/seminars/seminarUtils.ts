import type { Seminar, SeminarParticipant, SeminarParticipantStatus } from '@/types'

export const SEMINAR_STATUS_STYLE: Record<Seminar['status'], string> = {
  active: 'bg-success-50 text-success-800',
  completed: 'bg-brand-50 text-brand-700',
  closed: 'bg-neutral-100 text-neutral-600',
  dissolved: 'bg-danger-50 text-danger-800',
}

export const SEMINAR_STATUS_LABEL: Record<Seminar['status'], string> = {
  active: 'Active',
  completed: 'Completed',
  closed: 'Closed',
  dissolved: 'Dissolved',
}

export const PARTICIPANT_STATUS_ORDER: SeminarParticipantStatus[] = [
  'Pending Payment',
  'Registered',
  'Confirmed',
  'Attended',
  'Feedback Completed',
  'Certificate Sent',
  'Completed',
]

export const PARTICIPANT_STATUS_STYLE: Record<SeminarParticipantStatus, string> = {
  'Pending Payment': 'bg-warning-50 text-warning-800',
  Registered: 'bg-neutral-100 text-neutral-600',
  Confirmed: 'bg-brand-50 text-brand-700',
  Attended: 'bg-brand-50 text-brand-700',
  'Feedback Completed': 'bg-success-50 text-success-800',
  'Certificate Sent': 'bg-success-50 text-success-800',
  Completed: 'bg-success-50 text-success-800',
}

/** Whether a participant record counts as "Active" per the simplified lifecycle in the spec
 *  (registered & paid, seminar not yet started) vs. "Inactive" (completed/cancelled/dissolved). */
export function isParticipantActive(p: SeminarParticipant, seminar?: Seminar): boolean {
  if (seminar && (seminar.status === 'completed' || seminar.status === 'dissolved')) return false
  return p.status !== 'Completed' && p.status !== 'Certificate Sent'
}

export function progressPercent(p: SeminarParticipant): number {
  if (!p.progress) return 0
  const steps = [p.progress.registration, p.progress.payment, p.progress.seminarProper, p.progress.feedbackForm, p.progress.certificate]
  return Math.round((steps.filter(Boolean).length / steps.length) * 100)
}

export function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function seminarYears(seminars: Seminar[]): string[] {
  return Array.from(new Set(seminars.map((s) => s.date.slice(0, 4)))).sort().reverse()
}

export function seminarEarningsTotal(participants: SeminarParticipant[]): number {
  return participants.reduce((sum, p) => sum + (p.payment?.status === 'Paid' ? p.payment.amount ?? 0 : 0), 0)
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
