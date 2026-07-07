import type { Batch, Trainee, SeminarParticipant } from '@/types'
import { computePaymentBreakdown, taskRecords } from '@/data/mockData'
import { seminarEarningsTotal } from '@/pages/seminars/seminarUtils'

export { formatCurrency } from '@/pages/payments/paymentsUtils'

/**
 * Total revenue across the org: trainee OJT/upskill payments (Payments module) plus
 * seminar registration fees (Seminars module). The two stay as separate ledgers with
 * their own record-keeping — this just rolls both up for dashboard/reporting display,
 * per the decision to aggregate at the reporting layer rather than merge the two
 * payment data models.
 */
export function computeTotalEarnings(trainees: Trainee[], seminarParticipants: SeminarParticipant[]): number {
  const traineeTotal = trainees.reduce((sum, t) => sum + computePaymentBreakdown(t).totalAmountPaid, 0)
  return traineeTotal + seminarEarningsTotal(seminarParticipants)
}

/** Parses the batch's "started" display date (e.g. "Apr 14, 2026") into a comparable ISO string. */
export function parseDisplayDate(display: string): string {
  const d = new Date(display)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export interface BatchFinancials {
  totalReceived: number
  totalBalance: number
  totalDue: number
  traineeCount: number
  completedCount: number
  terminatedCount: number
}

/**
 * Rolls up payment figures for a set of trainees. Terminated trainees are always
 * included in the sums (they still owe / may have paid), per the requirement that
 * balances and payment summaries factor in terminated trainees automatically.
 */
export function computeGroupFinancials(traineeList: Trainee[]): BatchFinancials {
  let totalReceived = 0
  let totalBalance = 0
  let totalDue = 0
  let completedCount = 0
  let terminatedCount = 0

  for (const t of traineeList) {
    const b = computePaymentBreakdown(t)
    totalReceived += b.totalAmountPaid
    totalBalance += Math.max(0, b.outstandingBalance)
    totalDue += b.netAmountDue
    if (t.status === 'completed' || t.completedHrs >= t.requiredHrs) completedCount += 1
    if (t.status === 'terminated') terminatedCount += 1
  }

  return {
    totalReceived,
    totalBalance,
    totalDue,
    traineeCount: traineeList.length,
    completedCount,
    terminatedCount,
  }
}

/** Completed activities (task records) for a given batch number. */
export function getCompletedActivitiesForBatch(batchNo: string) {
  return taskRecords.filter((r) => r.batchNo === batchNo && r.status === 'completed')
}

/** Whether a batch's start date falls within the given [from, to] range (inclusive, either bound optional). */
export function batchInDateRange(batch: Batch, from: string, to: string): boolean {
  if (!from && !to) return true
  const started = parseDisplayDate(batch.started)
  if (!started) return true
  if (from && started < from) return false
  if (to && started > to) return false
  return true
}
