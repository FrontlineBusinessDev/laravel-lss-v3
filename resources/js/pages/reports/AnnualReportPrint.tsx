import { LogoMark } from '@/components/Logo';
import type { Batch, Trainee } from '@/types';
import { computePaymentBreakdown } from '@/data/mockData';
import { computeGroupFinancials, formatCurrency } from './reportsUtils';
interface AnnualReportPrintProps {
  batches: Batch[];
  traineesByBatch: Map<string, Trainee[]>;
  generatedAt: string;
  dateRangeLabel: string;
}
export function AnnualReportPrint({
  batches,
  traineesByBatch,
  generatedAt,
  dateRangeLabel
}: AnnualReportPrintProps) {
  const allTrainees = batches.flatMap(b => traineesByBatch.get(b.batchNo) ?? []);
  const overall = computeGroupFinancials(allTrainees);
  return <div className="hidden print:block print-area bg-white text-ink" data-cy="annual-report-print-div-1">
      <section className="p-8" data-cy="annual-report-print-section-2">
        <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4" data-cy="annual-report-print-header-3">
          <div className="flex items-center gap-3" data-cy="annual-report-print-div-4">
            <LogoMark size={38} data-cy="annual-report-print-logo-mark-5" />
            <div data-cy="annual-report-print-div-6">
              <div className="text-sm font-bold tracking-wide" data-cy="annual-report-print-div-frontline-business-solutions">FRONTLINE BUSINESS SOLUTIONS</div>
              <div className="text-[10px] text-neutral-500" data-cy="annual-report-print-div-learning-solutions-system">Learning Solutions System</div>
            </div>
          </div>
          <div className="text-right" data-cy="annual-report-print-div-9">
            <div className="text-base font-bold" data-cy="annual-report-print-div-annual-report">Annual Report</div>
            <div className="text-[10px] text-neutral-500" data-cy="annual-report-print-div-11">{dateRangeLabel}</div>
            <div className="text-[10px] text-neutral-500" data-cy="annual-report-print-div-generated">Generated {generatedAt}</div>
          </div>
        </header>

        <table className="mb-6 w-full border-collapse text-[11px]" data-cy="annual-report-print-table-13">
          <tbody data-cy="annual-report-print-tbody-14">
            <tr data-cy="annual-report-print-tr-15">
              <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="annual-report-print-td-total-batches">Total batches</td>
              <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-17">{batches.length}</td>
              <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="annual-report-print-td-total-trainees">Total trainees</td>
              <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-19">{overall.traineeCount}</td>
            </tr>
            <tr data-cy="annual-report-print-tr-20">
              <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="annual-report-print-td-completed-trainees">Completed trainees</td>
              <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-22">{overall.completedCount}</td>
              <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="annual-report-print-td-terminated-trainees">Terminated trainees</td>
              <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-24">{overall.terminatedCount}</td>
            </tr>
            <tr data-cy="annual-report-print-tr-25">
              <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="annual-report-print-td-total-received-amount">Total received amount</td>
              <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-27">{formatCurrency(overall.totalReceived)}</td>
              <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="annual-report-print-td-total-balance">Total balance</td>
              <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-29">{formatCurrency(overall.totalBalance)}</td>
            </tr>
          </tbody>
        </table>

        {batches.map(batch => {
        const list = traineesByBatch.get(batch.batchNo) ?? [];
        const fin = computeGroupFinancials(list);
        return <div key={batch.id} className="mb-6" style={{
          pageBreakInside: 'avoid'
        }} data-cy="annual-report-print-div-30">
              <div className="mb-2 flex items-center justify-between border-b border-ink pb-1" data-cy="annual-report-print-div-31">
                <div className="text-xs font-bold" data-cy="annual-report-print-div-32">{batch.batchNo} &mdash; {batch.programType}</div>
                <div className="text-[10px] text-neutral-500" data-cy="annual-report-print-div-to">
                  {batch.started} to {batch.projectedEnd} &middot; {batch.industry} &middot; {batch.setup}
                </div>
              </div>
              <table className="w-full border-collapse text-[11px]" data-cy="annual-report-print-table-34">
                <thead data-cy="annual-report-print-thead-35">
                  <tr className="border border-ink bg-neutral-100" data-cy="annual-report-print-tr-36">
                    <th className="border border-ink px-2 py-1.5 text-left" data-cy="annual-report-print-th-trainee">Trainee</th>
                    <th className="border border-ink px-2 py-1.5 text-left" data-cy="annual-report-print-th-school">School</th>
                    <th className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-th-hours">Hours</th>
                    <th className="border border-ink px-2 py-1.5 text-left" data-cy="annual-report-print-th-status">Status</th>
                    <th className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-th-received">Received</th>
                    <th className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-th-balance">Balance</th>
                  </tr>
                </thead>
                <tbody data-cy="annual-report-print-tbody-43">
                  {list.map(t => {
                const b = computePaymentBreakdown(t);
                const completed = t.status === 'completed' || t.completedHrs >= t.requiredHrs;
                return <tr key={t.id} data-cy="annual-report-print-tr-44">
                        <td className="border border-ink px-2 py-1.5" data-cy="annual-report-print-td-45">{t.name}</td>
                        <td className="border border-ink px-2 py-1.5" data-cy="annual-report-print-td-46">{t.school}</td>
                        <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-47">
                          {t.completedHrs}/{t.requiredHrs}
                        </td>
                        <td className="border border-ink px-2 py-1.5" data-cy="annual-report-print-td-48">
                          {t.status === 'terminated' ? 'Terminated' : completed ? 'Completed' : t.status}
                        </td>
                        <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-49">{formatCurrency(b.totalAmountPaid)}</td>
                        <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-50">{formatCurrency(Math.max(0, b.outstandingBalance))}</td>
                      </tr>;
              })}
                  {list.length === 0 && <tr data-cy="annual-report-print-tr-51">
                      <td className="border border-ink px-2 py-2 text-center text-neutral-400" colSpan={6} data-cy="annual-report-print-td-no-trainees-in-this-batch">No trainees in this batch.</td>
                    </tr>}
                </tbody>
                <tfoot data-cy="annual-report-print-tfoot-53">
                  <tr className="bg-neutral-100 font-semibold" data-cy="annual-report-print-tr-54">
                    <td className="border border-ink px-2 py-1.5" colSpan={4} data-cy="annual-report-print-td-batch-total">Batch total</td>
                    <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-56">{formatCurrency(fin.totalReceived)}</td>
                    <td className="border border-ink px-2 py-1.5 text-right" data-cy="annual-report-print-td-57">{formatCurrency(fin.totalBalance)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>;
      })}

        {batches.length === 0 && <div className="text-sm text-neutral-500" data-cy="annual-report-print-div-no-batches-match-the-applied-filters">No batches match the applied filters.</div>}
      </section>
    </div>;
}