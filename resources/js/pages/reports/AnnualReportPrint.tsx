import { LogoMark } from '@/components/Logo'
import type { Batch, Trainee } from '@/types'
import { computePaymentBreakdown } from '@/data/mockData'
import { computeGroupFinancials, formatCurrency } from './reportsUtils'

interface AnnualReportPrintProps {
  batches: Batch[]
  traineesByBatch: Map<string, Trainee[]>
  generatedAt: string
  dateRangeLabel: string
}

export function AnnualReportPrint({ batches, traineesByBatch, generatedAt, dateRangeLabel }: AnnualReportPrintProps) {
  const allTrainees = batches.flatMap((b) => traineesByBatch.get(b.batchNo) ?? [])
  const overall = computeGroupFinancials(allTrainees)

  return (
    <div className="hidden print:block print-area bg-white text-ink">
      <section className="p-8">
        <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4">
          <div className="flex items-center gap-3">
            <LogoMark size={38} />
            <div>
              <div className="text-sm font-bold tracking-wide">FRONTLINE BUSINESS SOLUTIONS</div>
              <div className="text-[10px] text-neutral-500">Learning Solutions System</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-bold">Annual Report</div>
            <div className="text-[10px] text-neutral-500">{dateRangeLabel}</div>
            <div className="text-[10px] text-neutral-500">Generated {generatedAt}</div>
          </div>
        </header>

        <table className="mb-6 w-full border-collapse text-[11px]">
          <tbody>
            <tr>
              <td className="border border-ink px-2 py-1.5 font-semibold">Total batches</td>
              <td className="border border-ink px-2 py-1.5 text-right">{batches.length}</td>
              <td className="border border-ink px-2 py-1.5 font-semibold">Total trainees</td>
              <td className="border border-ink px-2 py-1.5 text-right">{overall.traineeCount}</td>
            </tr>
            <tr>
              <td className="border border-ink px-2 py-1.5 font-semibold">Completed trainees</td>
              <td className="border border-ink px-2 py-1.5 text-right">{overall.completedCount}</td>
              <td className="border border-ink px-2 py-1.5 font-semibold">Terminated trainees</td>
              <td className="border border-ink px-2 py-1.5 text-right">{overall.terminatedCount}</td>
            </tr>
            <tr>
              <td className="border border-ink px-2 py-1.5 font-semibold">Total received amount</td>
              <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(overall.totalReceived)}</td>
              <td className="border border-ink px-2 py-1.5 font-semibold">Total balance</td>
              <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(overall.totalBalance)}</td>
            </tr>
          </tbody>
        </table>

        {batches.map((batch) => {
          const list = traineesByBatch.get(batch.batchNo) ?? []
          const fin = computeGroupFinancials(list)
          return (
            <div key={batch.id} className="mb-6" style={{ pageBreakInside: 'avoid' }}>
              <div className="mb-2 flex items-center justify-between border-b border-ink pb-1">
                <div className="text-xs font-bold">{batch.batchNo} &mdash; {batch.programType}</div>
                <div className="text-[10px] text-neutral-500">
                  {batch.started} to {batch.projectedEnd} &middot; {batch.industry} &middot; {batch.setup}
                </div>
              </div>
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="border border-ink bg-neutral-100">
                    <th className="border border-ink px-2 py-1.5 text-left">Trainee</th>
                    <th className="border border-ink px-2 py-1.5 text-left">School</th>
                    <th className="border border-ink px-2 py-1.5 text-right">Hours</th>
                    <th className="border border-ink px-2 py-1.5 text-left">Status</th>
                    <th className="border border-ink px-2 py-1.5 text-right">Received</th>
                    <th className="border border-ink px-2 py-1.5 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((t) => {
                    const b = computePaymentBreakdown(t)
                    const completed = t.status === 'completed' || t.completedHrs >= t.requiredHrs
                    return (
                      <tr key={t.id}>
                        <td className="border border-ink px-2 py-1.5">{t.name}</td>
                        <td className="border border-ink px-2 py-1.5">{t.school}</td>
                        <td className="border border-ink px-2 py-1.5 text-right">
                          {t.completedHrs}/{t.requiredHrs}
                        </td>
                        <td className="border border-ink px-2 py-1.5">
                          {t.status === 'terminated' ? 'Terminated' : completed ? 'Completed' : t.status}
                        </td>
                        <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(b.totalAmountPaid)}</td>
                        <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(Math.max(0, b.outstandingBalance))}</td>
                      </tr>
                    )
                  })}
                  {list.length === 0 && (
                    <tr>
                      <td className="border border-ink px-2 py-2 text-center text-neutral-400" colSpan={6}>No trainees in this batch.</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-neutral-100 font-semibold">
                    <td className="border border-ink px-2 py-1.5" colSpan={4}>Batch total</td>
                    <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(fin.totalReceived)}</td>
                    <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(fin.totalBalance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )
        })}

        {batches.length === 0 && <div className="text-sm text-neutral-500">No batches match the applied filters.</div>}
      </section>
    </div>
  )
}
