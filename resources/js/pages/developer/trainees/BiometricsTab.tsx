import { useMemo, useState } from 'react';
import { Printer, AlertTriangle } from 'lucide-react';
import type { Trainee } from '@/types';
import { biometricRecords, computeHoursRendered, isRecordFlagged } from '@/data/mockData';
import { missingPunchLabel } from '@/pages/developer/biometrics/biometricsUtils';
import { BiometricsPrint } from '@/pages/developer/biometrics/BiometricsPrint';
export function BiometricsTab({
  trainee
}: {
  trainee: Trainee;
}) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const records = useMemo(() => {
    return biometricRecords.filter(r => r.traineeId === trainee.id).filter(r => dateFrom ? r.date >= dateFrom : true).filter(r => dateTo ? r.date <= dateTo : true).sort((a, b) => a.date < b.date ? 1 : -1);
  }, [trainee.id, dateFrom, dateTo]);
  const totalHours = records.reduce((sum, r) => sum + computeHoursRendered(r), 0);
  return <div className="rounded-lg border border-neutral-200 bg-white p-5" data-cy="biometrics-tab-div-1">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between no-print" data-cy="biometrics-tab-div-2">
        <div data-cy="biometrics-tab-div-3">
          <h3 className="text-sm font-semibold text-ink" data-cy="biometrics-tab-h3-biometric-records">Biometric records</h3>
          <p className="text-xs text-neutral-500" data-cy="biometrics-tab-p-attendance-logs-for">Attendance logs for {trainee.name} · view-and-print only. Import and bulk edits happen in Admin {'>'} Biometrics.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2" data-cy="biometrics-tab-div-6">
          <div data-cy="biometrics-tab-div-7">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="biometrics-tab-label-from">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-8 rounded-md border border-neutral-200 px-2 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="biometrics-tab-input-date" />
          </div>
          <div data-cy="biometrics-tab-div-10">
            <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="biometrics-tab-label-to">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-8 rounded-md border border-neutral-200 px-2 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="biometrics-tab-input-date-2" />
          </div>
          <button onClick={() => window.print()} disabled={records.length === 0} className="flex h-8 items-center gap-1.5 rounded-md border border-neutral-200 px-3 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50" data-cy="biometrics-tab-button-print">
            <Printer size={13} data-cy="biometrics-tab-printer-14" /> Print
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-neutral-200 no-print" data-cy="biometrics-tab-div-15">
        <table className="w-full border-collapse text-sm" data-cy="biometrics-tab-table-16">
          <thead data-cy="biometrics-tab-thead-17">
            <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="biometrics-tab-tr-18">
              <th className="px-3 py-2" data-cy="biometrics-tab-th-date">Date</th>
              <th className="px-3 py-2" data-cy="biometrics-tab-th-time-in">Time in</th>
              <th className="px-3 py-2" data-cy="biometrics-tab-th-time-out">Time out</th>
              <th className="px-3 py-2" data-cy="biometrics-tab-th-hours-rendered">Hours rendered</th>
              <th className="px-3 py-2" data-cy="biometrics-tab-th-remarks">Remarks</th>
            </tr>
          </thead>
          <tbody data-cy="biometrics-tab-tbody-24">
            {records.map(r => <tr key={r.id} className="border-t border-neutral-100" data-cy="biometrics-tab-tr-25">
                <td className="px-3 py-2.5 font-mono text-xs text-neutral-600" data-cy="biometrics-tab-td-26">{r.date}</td>
                <td className="px-3 py-2.5 text-neutral-600" data-cy="biometrics-tab-td-27">{r.timeIn ?? '—'}</td>
                <td className="px-3 py-2.5 text-neutral-600" data-cy="biometrics-tab-td-28">{r.timeOut ?? '—'}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-neutral-600" data-cy="biometrics-tab-td-h">{computeHoursRendered(r)}h</td>
                <td className="px-3 py-2.5" data-cy="biometrics-tab-td-30">
                  {r.onLeave && <span className="inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600" data-cy="biometrics-tab-span-on-leave">On leave</span>}
                  {isRecordFlagged(r) && <span className="inline-flex items-center gap-1 rounded-pill bg-danger-50 px-2.5 py-0.5 text-xs font-medium text-danger-800" data-cy="biometrics-tab-span-32">
                      <AlertTriangle size={11} data-cy="biometrics-tab-alert-triangle-33" /> {missingPunchLabel(r)}
                    </span>}
                </td>
              </tr>)}
            {records.length === 0 && <tr data-cy="biometrics-tab-tr-34">
                <td colSpan={5} className="px-3 py-8 text-center text-xs text-neutral-400" data-cy="biometrics-tab-td-no-biometric-records-for-the-selected">
                  No biometric records for the selected range.
                </td>
              </tr>}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex justify-end text-xs text-neutral-500 no-print" data-cy="biometrics-tab-div-total-hours-rendered-filtered">
        Total hours rendered (filtered): <span className="ml-1 font-mono font-semibold text-ink" data-cy="biometrics-tab-span-h">{totalHours}h</span>
      </div>

      <BiometricsPrint trainee={trainee} records={records} totalHours={totalHours} generatedAt={new Date().toLocaleString('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })} data-cy="biometrics-tab-biometrics-print-38" />
    </div>;
}