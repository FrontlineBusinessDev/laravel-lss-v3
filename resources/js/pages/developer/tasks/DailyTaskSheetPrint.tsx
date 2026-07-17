import { LogoMark } from '@/components/Logo';
import type { TaskRecord } from '@/types';
interface DailyTaskSheetPrintProps {
  rows: TaskRecord[];
  generatedAt: string;
  dateRangeLabel: string;
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
export function DailyTaskSheetPrint({
  rows,
  generatedAt,
  dateRangeLabel
}: DailyTaskSheetPrintProps) {
  const byTrainee = new Map<string, TaskRecord[]>();
  for (const r of rows) {
    const list = byTrainee.get(r.trainee) ?? [];
    list.push(r);
    byTrainee.set(r.trainee, list);
  }
  return <div className="hidden print:block print-area bg-white text-ink" data-cy="daily-task-sheet-print-div-1">
      {[...byTrainee.entries()].map(([trainee, tasks], idx) => {
      const totalTimeSpent = tasks.reduce((sum, t) => sum + (t.onLeave ? 0 : t.timeSpent), 0);
      const totalTimeGoal = tasks.reduce((sum, t) => sum + t.timeGoal, 0);
      const trainers = [...new Set(tasks.map(t => t.trainer))].join(', ');
      const batchNo = tasks[0]?.batchNo ?? '';
      return <section key={trainee} className="p-8" style={{
        pageBreakAfter: idx < byTrainee.size - 1 ? 'always' : 'auto'
      }} data-cy="daily-task-sheet-print-section-2">
            <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4" data-cy="daily-task-sheet-print-header-3">
              <div className="flex items-center gap-3" data-cy="daily-task-sheet-print-div-4">
                <LogoMark size={38} data-cy="daily-task-sheet-print-logo-mark-5" />
                <div data-cy="daily-task-sheet-print-div-6">
                  <div className="text-sm font-bold tracking-wide" data-cy="daily-task-sheet-print-div-frontline-business-solutions">FRONTLINE BUSINESS SOLUTIONS</div>
                  <div className="text-[10px] text-neutral-500" data-cy="daily-task-sheet-print-div-learning-solutions-system">Learning Solutions System</div>
                </div>
              </div>
              <div className="text-right" data-cy="daily-task-sheet-print-div-9">
                <div className="text-base font-bold" data-cy="daily-task-sheet-print-div-daily-task-sheet">Daily Task Sheet</div>
                <div className="text-[10px] text-neutral-500" data-cy="daily-task-sheet-print-div-11">{dateRangeLabel}</div>
              </div>
            </header>

            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs" data-cy="daily-task-sheet-print-div-12">
              <div data-cy="daily-task-sheet-print-div-13"><span className="font-semibold" data-cy="daily-task-sheet-print-span-trainee-name">Trainee Name:</span> {trainee}</div>
              <div data-cy="daily-task-sheet-print-div-15"><span className="font-semibold" data-cy="daily-task-sheet-print-span-batch">Batch:</span> {batchNo}</div>
              <div data-cy="daily-task-sheet-print-div-17"><span className="font-semibold" data-cy="daily-task-sheet-print-span-trainer-s">Trainer(s):</span> {trainers}</div>
              <div data-cy="daily-task-sheet-print-div-19"><span className="font-semibold" data-cy="daily-task-sheet-print-span-report-generated">Report generated:</span> {generatedAt}</div>
            </div>

            <table className="w-full border-collapse text-[11px]" data-cy="daily-task-sheet-print-table-21">
              <thead data-cy="daily-task-sheet-print-thead-22">
                <tr className="border border-ink bg-neutral-100" data-cy="daily-task-sheet-print-tr-23">
                  <th className="border border-ink px-2 py-1.5 text-left" data-cy="daily-task-sheet-print-th-date">Date</th>
                  <th className="border border-ink px-2 py-1.5 text-left" data-cy="daily-task-sheet-print-th-task">Task</th>
                  <th className="border border-ink px-2 py-1.5 text-left" data-cy="daily-task-sheet-print-th-description">Description</th>
                  <th className="border border-ink px-2 py-1.5 text-right" data-cy="daily-task-sheet-print-th-time-goal">Time Goal</th>
                  <th className="border border-ink px-2 py-1.5 text-right" data-cy="daily-task-sheet-print-th-time-spent">Time Spent</th>
                  <th className="border border-ink px-2 py-1.5 text-left" data-cy="daily-task-sheet-print-th-remarks">Remarks</th>
                </tr>
              </thead>
              <tbody data-cy="daily-task-sheet-print-tbody-30">
                {tasks.map(t => <tr key={t.id} data-cy="daily-task-sheet-print-tr-31">
                    <td className="border border-ink px-2 py-1.5" data-cy="daily-task-sheet-print-td-32">{t.date}</td>
                    <td className="border border-ink px-2 py-1.5 font-medium" data-cy="daily-task-sheet-print-td-33">{t.task}</td>
                    <td className="border border-ink px-2 py-1.5" data-cy="daily-task-sheet-print-td-34">{t.description}</td>
                    <td className="border border-ink px-2 py-1.5 text-right" data-cy="daily-task-sheet-print-td-h">{t.timeGoal}h</td>
                    <td className="border border-ink px-2 py-1.5 text-right" data-cy="daily-task-sheet-print-td-36">{t.onLeave ? '0h' : `${t.timeSpent}h`}</td>
                    <td className="border border-ink px-2 py-1.5" data-cy="daily-task-sheet-print-td-37">{t.onLeave ? t.leaveReason ?? 'On approved leave' : t.remarks ?? '\u2014'}</td>
                  </tr>)}
              </tbody>
              <tfoot data-cy="daily-task-sheet-print-tfoot-38">
                <tr className="bg-neutral-100 font-semibold" data-cy="daily-task-sheet-print-tr-39">
                  <td className="border border-ink px-2 py-1.5" colSpan={3} data-cy="daily-task-sheet-print-td-total">Total</td>
                  <td className="border border-ink px-2 py-1.5 text-right" data-cy="daily-task-sheet-print-td-h-2">{totalTimeGoal}h</td>
                  <td className="border border-ink px-2 py-1.5 text-right" data-cy="daily-task-sheet-print-td-h-3">{totalTimeSpent}h</td>
                  <td className="border border-ink px-2 py-1.5" data-cy="daily-task-sheet-print-td-43" />
                </tr>
              </tfoot>
            </table>

            <div className="mt-14 grid grid-cols-2 gap-10 text-xs" data-cy="daily-task-sheet-print-div-44">
              <div data-cy="daily-task-sheet-print-div-45">
                <div className="border-t border-ink pt-1.5" data-cy="daily-task-sheet-print-div-trainee-signature-over-printed-name">Trainee Signature over Printed Name</div>
              </div>
              <div data-cy="daily-task-sheet-print-div-47">
                <div className="border-t border-ink pt-1.5" data-cy="daily-task-sheet-print-div-trainer-signature-over-printed-name">Trainer Signature over Printed Name</div>
              </div>
            </div>
          </section>;
    })}

      {byTrainee.size === 0 && <div className="p-8 text-sm text-neutral-500" data-cy="daily-task-sheet-print-div-no-records-match-the-applied-filters">No records match the applied filters.</div>}
    </div>;
}