import { LogoMark } from '@/components/Logo'
import type { Batch } from '@/types'
import { getCompletedActivitiesForBatch, computeGroupFinancials, formatCurrency } from './reportsUtils'
import type { Trainee } from '@/types'

interface BatchReportPrintProps {
  batches: Batch[]
  traineesByBatch: Map<string, Trainee[]>
  generatedAt: string
  dateRangeLabel: string
}

export function BatchReportPrint({ batches, traineesByBatch, generatedAt, dateRangeLabel }: BatchReportPrintProps) {
  return (
    <div className="hidden print:block print-area bg-white text-ink">
      {batches.map((batch, idx) => {
        const activities = getCompletedActivitiesForBatch(batch.batchNo)
        const list = traineesByBatch.get(batch.batchNo) ?? []
        const fin = computeGroupFinancials(list)

        return (
          <section key={batch.id} className="p-8" style={{ pageBreakAfter: idx < batches.length - 1 ? 'always' : 'auto' }}>
            <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4">
              <div className="flex items-center gap-3">
                <LogoMark size={38} />
                <div>
                  <div className="text-sm font-bold tracking-wide">FRONTLINE BUSINESS SOLUTIONS</div>
                  <div className="text-[10px] text-neutral-500">Learning Solutions System</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold">Batch Report</div>
                <div className="text-[10px] text-neutral-500">{dateRangeLabel}</div>
                <div className="text-[10px] text-neutral-500">Generated {generatedAt}</div>
              </div>
            </header>

            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div><span className="font-semibold">Batch No.:</span> {batch.batchNo}</div>
              <div><span className="font-semibold">Program Type:</span> {batch.programType}</div>
              <div><span className="font-semibold">Industry:</span> {batch.industry}</div>
              <div><span className="font-semibold">Setup:</span> {batch.setup}</div>
              <div><span className="font-semibold">Started:</span> {batch.started}</div>
              <div><span className="font-semibold">Projected End:</span> {batch.projectedEnd}</div>
              <div><span className="font-semibold">Status:</span> {batch.status}</div>
              <div><span className="font-semibold">Trainees:</span> {list.length}</div>
            </div>

            <div className="mb-1.5 text-xs font-bold">Completed Activities</div>
            <table className="mb-5 w-full border-collapse text-[11px]">
              <thead>
                <tr className="border border-ink bg-neutral-100">
                  <th className="border border-ink px-2 py-1.5 text-left">Task</th>
                  <th className="border border-ink px-2 py-1.5 text-left">Trainee</th>
                  <th className="border border-ink px-2 py-1.5 text-left">Trainer</th>
                  <th className="border border-ink px-2 py-1.5 text-right">Time Goal</th>
                  <th className="border border-ink px-2 py-1.5 text-right">Time Spent</th>
                  <th className="border border-ink px-2 py-1.5 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td className="border border-ink px-2 py-1.5">{a.task}</td>
                    <td className="border border-ink px-2 py-1.5">{a.trainee}</td>
                    <td className="border border-ink px-2 py-1.5">{a.trainer}</td>
                    <td className="border border-ink px-2 py-1.5 text-right">{a.timeGoal}h</td>
                    <td className="border border-ink px-2 py-1.5 text-right">{a.timeSpent}h</td>
                    <td className="border border-ink px-2 py-1.5">{a.date}</td>
                  </tr>
                ))}
                {activities.length === 0 && (
                  <tr>
                    <td className="border border-ink px-2 py-2 text-center text-neutral-400" colSpan={6}>No completed activities recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mb-1.5 text-xs font-bold">Financial Summary</div>
            <table className="w-full border-collapse text-[11px]">
              <tbody>
                <tr>
                  <td className="border border-ink px-2 py-1.5 font-semibold">Total received amount</td>
                  <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(fin.totalReceived)}</td>
                  <td className="border border-ink px-2 py-1.5 font-semibold">Total balance</td>
                  <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(fin.totalBalance)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-14 grid grid-cols-2 gap-10 text-xs">
              <div><div className="border-t border-ink pt-1.5">Prepared By</div></div>
              <div><div className="border-t border-ink pt-1.5">Approved By</div></div>
            </div>
          </section>
        )
      })}

      {batches.length === 0 && <div className="p-8 text-sm text-neutral-500">No batches match the applied filters.</div>}
    </div>
  )
}
