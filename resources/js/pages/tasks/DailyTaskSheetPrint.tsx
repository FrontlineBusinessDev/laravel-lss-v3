import { LogoMark } from '@/components/Logo'
import type { TaskRecord } from '@/types'

interface DailyTaskSheetPrintProps {
  rows: TaskRecord[]
  generatedAt: string
  dateRangeLabel: string
}

/**
 * Print-only layout for the Daily Task Sheet. Hidden on screen (`hidden`),
 * shown only inside the print media query (`print:block`, combined with the
 * global `.print-area` isolation rule in index.css).
 *
 * Per trainee: Trainee Name, Batch, Trainer, and their list of
 * Task / Description / Time Goal / Time Spent / Remarks / Date — with a
 * signature line, matching the spec's "Daily Task Sheet" contents.
 */
export function DailyTaskSheetPrint({ rows, generatedAt, dateRangeLabel }: DailyTaskSheetPrintProps) {
  const byTrainee = new Map<string, TaskRecord[]>()
  for (const r of rows) {
    const list = byTrainee.get(r.trainee) ?? []
    list.push(r)
    byTrainee.set(r.trainee, list)
  }

  return (
    <div className="hidden print:block print-area bg-white text-ink">
      {[...byTrainee.entries()].map(([trainee, tasks], idx) => {
        const totalTimeSpent = tasks.reduce((sum, t) => sum + (t.onLeave ? 0 : t.timeSpent), 0)
        const totalTimeGoal = tasks.reduce((sum, t) => sum + t.timeGoal, 0)
        const trainers = [...new Set(tasks.map((t) => t.trainer))].join(', ')
        const batchNo = tasks[0]?.batchNo ?? ''

        return (
          <section key={trainee} className="p-8" style={{ pageBreakAfter: idx < byTrainee.size - 1 ? 'always' : 'auto' }}>
            <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4">
              <div className="flex items-center gap-3">
                <LogoMark size={38} />
                <div>
                  <div className="text-sm font-bold tracking-wide">FRONTLINE BUSINESS SOLUTIONS</div>
                  <div className="text-[10px] text-neutral-500">Learning Solutions System</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-base font-bold">Daily Task Sheet</div>
                <div className="text-[10px] text-neutral-500">{dateRangeLabel}</div>
              </div>
            </header>

            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              <div><span className="font-semibold">Trainee Name:</span> {trainee}</div>
              <div><span className="font-semibold">Batch:</span> {batchNo}</div>
              <div><span className="font-semibold">Trainer(s):</span> {trainers}</div>
              <div><span className="font-semibold">Report generated:</span> {generatedAt}</div>
            </div>

            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr className="border border-ink bg-neutral-100">
                  <th className="border border-ink px-2 py-1.5 text-left">Date</th>
                  <th className="border border-ink px-2 py-1.5 text-left">Task</th>
                  <th className="border border-ink px-2 py-1.5 text-left">Description</th>
                  <th className="border border-ink px-2 py-1.5 text-right">Time Goal</th>
                  <th className="border border-ink px-2 py-1.5 text-right">Time Spent</th>
                  <th className="border border-ink px-2 py-1.5 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td className="border border-ink px-2 py-1.5">{t.date}</td>
                    <td className="border border-ink px-2 py-1.5 font-medium">{t.task}</td>
                    <td className="border border-ink px-2 py-1.5">{t.description}</td>
                    <td className="border border-ink px-2 py-1.5 text-right">{t.timeGoal}h</td>
                    <td className="border border-ink px-2 py-1.5 text-right">{t.onLeave ? '0h' : `${t.timeSpent}h`}</td>
                    <td className="border border-ink px-2 py-1.5">{t.onLeave ? t.leaveReason ?? 'On approved leave' : t.remarks ?? '\u2014'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-100 font-semibold">
                  <td className="border border-ink px-2 py-1.5" colSpan={3}>Total</td>
                  <td className="border border-ink px-2 py-1.5 text-right">{totalTimeGoal}h</td>
                  <td className="border border-ink px-2 py-1.5 text-right">{totalTimeSpent}h</td>
                  <td className="border border-ink px-2 py-1.5" />
                </tr>
              </tfoot>
            </table>

            <div className="mt-14 grid grid-cols-2 gap-10 text-xs">
              <div>
                <div className="border-t border-ink pt-1.5">Trainee Signature over Printed Name</div>
              </div>
              <div>
                <div className="border-t border-ink pt-1.5">Trainer Signature over Printed Name</div>
              </div>
            </div>
          </section>
        )
      })}

      {byTrainee.size === 0 && (
        <div className="p-8 text-sm text-neutral-500">No records match the applied filters.</div>
      )}
    </div>
  )
}
