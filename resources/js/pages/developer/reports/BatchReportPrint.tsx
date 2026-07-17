import { LogoMark } from '@/components/Logo';
import type { Batch } from '@/types';
import { getCompletedActivitiesForBatch, computeGroupFinancials, formatCurrency } from './reportsUtils';
import type { Trainee } from '@/types';
interface BatchReportPrintProps {
  batches: Batch[];
  traineesByBatch: Map<string, Trainee[]>;
  generatedAt: string;
  dateRangeLabel: string;
}
export function BatchReportPrint({
  batches,
  traineesByBatch,
  generatedAt,
  dateRangeLabel
}: BatchReportPrintProps) {
  return <div className="hidden print:block print-area bg-white text-ink" data-cy="batch-report-print-div-1">
      {batches.map((batch, idx) => {
      const activities = getCompletedActivitiesForBatch(batch.batchNo);
      const list = traineesByBatch.get(batch.batchNo) ?? [];
      const fin = computeGroupFinancials(list);
      return <section key={batch.id} className="p-8" style={{
        pageBreakAfter: idx < batches.length - 1 ? 'always' : 'auto'
      }} data-cy="batch-report-print-section-2">
            <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4" data-cy="batch-report-print-header-3">
              <div className="flex items-center gap-3" data-cy="batch-report-print-div-4">
                <LogoMark size={38} data-cy="batch-report-print-logo-mark-5" />
                <div data-cy="batch-report-print-div-6">
                  <div className="text-sm font-bold tracking-wide" data-cy="batch-report-print-div-frontline-business-solutions">FRONTLINE BUSINESS SOLUTIONS</div>
                  <div className="text-[10px] text-neutral-500" data-cy="batch-report-print-div-learning-solutions-system">Learning Solutions System</div>
                </div>
              </div>
              <div className="text-right" data-cy="batch-report-print-div-9">
                <div className="text-base font-bold" data-cy="batch-report-print-div-batch-report">Batch Report</div>
                <div className="text-[10px] text-neutral-500" data-cy="batch-report-print-div-11">{dateRangeLabel}</div>
                <div className="text-[10px] text-neutral-500" data-cy="batch-report-print-div-generated">Generated {generatedAt}</div>
              </div>
            </header>

            <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs" data-cy="batch-report-print-div-13">
              <div data-cy="batch-report-print-div-14"><span className="font-semibold" data-cy="batch-report-print-span-batch-no">Batch No.:</span> {batch.batchNo}</div>
              <div data-cy="batch-report-print-div-16"><span className="font-semibold" data-cy="batch-report-print-span-program-type">Program Type:</span> {batch.programType}</div>
              <div data-cy="batch-report-print-div-18"><span className="font-semibold" data-cy="batch-report-print-span-industry">Industry:</span> {batch.industry}</div>
              <div data-cy="batch-report-print-div-20"><span className="font-semibold" data-cy="batch-report-print-span-setup">Setup:</span> {batch.setup}</div>
              <div data-cy="batch-report-print-div-22"><span className="font-semibold" data-cy="batch-report-print-span-started">Started:</span> {batch.started}</div>
              <div data-cy="batch-report-print-div-24"><span className="font-semibold" data-cy="batch-report-print-span-projected-end">Projected End:</span> {batch.projectedEnd}</div>
              <div data-cy="batch-report-print-div-26"><span className="font-semibold" data-cy="batch-report-print-span-status">Status:</span> {batch.status}</div>
              <div data-cy="batch-report-print-div-28"><span className="font-semibold" data-cy="batch-report-print-span-trainees">Trainees:</span> {list.length}</div>
            </div>

            <div className="mb-1.5 text-xs font-bold" data-cy="batch-report-print-div-completed-activities">Completed Activities</div>
            <table className="mb-5 w-full border-collapse text-[11px]" data-cy="batch-report-print-table-31">
              <thead data-cy="batch-report-print-thead-32">
                <tr className="border border-ink bg-neutral-100" data-cy="batch-report-print-tr-33">
                  <th className="border border-ink px-2 py-1.5 text-left" data-cy="batch-report-print-th-task">Task</th>
                  <th className="border border-ink px-2 py-1.5 text-left" data-cy="batch-report-print-th-trainee">Trainee</th>
                  <th className="border border-ink px-2 py-1.5 text-left" data-cy="batch-report-print-th-trainer">Trainer</th>
                  <th className="border border-ink px-2 py-1.5 text-right" data-cy="batch-report-print-th-time-goal">Time Goal</th>
                  <th className="border border-ink px-2 py-1.5 text-right" data-cy="batch-report-print-th-time-spent">Time Spent</th>
                  <th className="border border-ink px-2 py-1.5 text-left" data-cy="batch-report-print-th-date">Date</th>
                </tr>
              </thead>
              <tbody data-cy="batch-report-print-tbody-40">
                {activities.map(a => <tr key={a.id} data-cy="batch-report-print-tr-41">
                    <td className="border border-ink px-2 py-1.5" data-cy="batch-report-print-td-42">{a.task}</td>
                    <td className="border border-ink px-2 py-1.5" data-cy="batch-report-print-td-43">{a.trainee}</td>
                    <td className="border border-ink px-2 py-1.5" data-cy="batch-report-print-td-44">{a.trainer}</td>
                    <td className="border border-ink px-2 py-1.5 text-right" data-cy="batch-report-print-td-h">{a.timeGoal}h</td>
                    <td className="border border-ink px-2 py-1.5 text-right" data-cy="batch-report-print-td-h-2">{a.timeSpent}h</td>
                    <td className="border border-ink px-2 py-1.5" data-cy="batch-report-print-td-47">{a.date}</td>
                  </tr>)}
                {activities.length === 0 && <tr data-cy="batch-report-print-tr-48">
                    <td className="border border-ink px-2 py-2 text-center text-neutral-400" colSpan={6} data-cy="batch-report-print-td-no-completed-activities-recorded">No completed activities recorded.</td>
                  </tr>}
              </tbody>
            </table>

            <div className="mb-1.5 text-xs font-bold" data-cy="batch-report-print-div-financial-summary">Financial Summary</div>
            <table className="w-full border-collapse text-[11px]" data-cy="batch-report-print-table-51">
              <tbody data-cy="batch-report-print-tbody-52">
                <tr data-cy="batch-report-print-tr-53">
                  <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="batch-report-print-td-total-received-amount">Total received amount</td>
                  <td className="border border-ink px-2 py-1.5 text-right" data-cy="batch-report-print-td-55">{formatCurrency(fin.totalReceived)}</td>
                  <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="batch-report-print-td-total-balance">Total balance</td>
                  <td className="border border-ink px-2 py-1.5 text-right" data-cy="batch-report-print-td-57">{formatCurrency(fin.totalBalance)}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-14 grid grid-cols-2 gap-10 text-xs" data-cy="batch-report-print-div-58">
              <div data-cy="batch-report-print-div-59"><div className="border-t border-ink pt-1.5" data-cy="batch-report-print-div-prepared-by">Prepared By</div></div>
              <div data-cy="batch-report-print-div-61"><div className="border-t border-ink pt-1.5" data-cy="batch-report-print-div-approved-by">Approved By</div></div>
            </div>
          </section>;
    })}

      {batches.length === 0 && <div className="p-8 text-sm text-neutral-500" data-cy="batch-report-print-div-no-batches-match-the-applied-filters">No batches match the applied filters.</div>}
    </div>;
}