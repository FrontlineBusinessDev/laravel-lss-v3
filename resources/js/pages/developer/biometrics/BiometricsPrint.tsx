import { LogoMark } from '@/components/Logo';
import { computeHoursRendered, isRecordFlagged } from '@/data/mockData';
import { missingPunchLabel, summarizeAttendance } from '@/pages/developer/biometrics/biometricsUtils';
import type { BiometricRecord, Trainee } from '@/types';
interface BiometricsPrintProps {
  trainee: Pick<Trainee, 'name' | 'school' | 'batchNo'>;
  records: BiometricRecord[];
  totalHours: number;
  generatedAt: string;
  /** 'print' (default): hidden on screen, shown only in the print media query.
   *  'preview': always visible, for showing the exact printable layout inside an on-screen modal. */
  variant?: 'print' | 'preview';
}

/**
 * Per-trainee attendance report, shared between the hidden print layout and
 * the on-screen "preview before printing" modal so both are guaranteed to
 * look identical.
 */
export function BiometricsPrint({
  trainee,
  records,
  totalHours,
  generatedAt,
  variant = 'print'
}: BiometricsPrintProps) {
  const sorted = [...records].sort((a, b) => a.date < b.date ? -1 : 1);
  const wrapperClass = variant === 'print' ? 'hidden print:block print-area bg-white p-8 text-ink' : 'bg-white p-6 text-ink border border-neutral-200 rounded-lg';
  return <div className={wrapperClass} data-cy="biometrics-print-div-1">
      <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4" data-cy="biometrics-print-header-2">
        <div className="flex items-center gap-3" data-cy="biometrics-print-div-3">
          <LogoMark size={38} data-cy="biometrics-print-logo-mark-4" />
          <div data-cy="biometrics-print-div-5">
            <div className="text-sm font-bold tracking-wide" data-cy="biometrics-print-div-frontline-business-solutions">FRONTLINE BUSINESS SOLUTIONS</div>
            <div className="text-[10px] text-neutral-500" data-cy="biometrics-print-div-learning-solutions-system">Learning Solutions System</div>
          </div>
        </div>
        <div className="text-right" data-cy="biometrics-print-div-8">
          <div className="text-base font-bold" data-cy="biometrics-print-div-biometrics-attendance-report">Biometrics / Attendance Report</div>
          <div className="text-[10px] text-neutral-500" data-cy="biometrics-print-div-generated">Generated {generatedAt}</div>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs" data-cy="biometrics-print-div-11">
        <div data-cy="biometrics-print-div-12"><span className="font-semibold" data-cy="biometrics-print-span-full-name">Full Name:</span> {trainee.name}</div>
        <div data-cy="biometrics-print-div-14"><span className="font-semibold" data-cy="biometrics-print-span-school">School:</span> {trainee.school}</div>
        <div data-cy="biometrics-print-div-16"><span className="font-semibold" data-cy="biometrics-print-span-batch">Batch:</span> {trainee.batchNo}</div>
        <div data-cy="biometrics-print-div-h"><span className="font-semibold" data-cy="biometrics-print-span-total-training-hours">Total Training Hours:</span> {totalHours}h</div>
        <div className="col-span-2" data-cy="biometrics-print-div-20"><span className="font-semibold" data-cy="biometrics-print-span-remarks">Remarks:</span> {summarizeAttendance(records)}</div>
      </div>

      <table className="w-full border-collapse text-[11px]" data-cy="biometrics-print-table-22">
        <thead data-cy="biometrics-print-thead-23">
          <tr className="border border-ink bg-neutral-100" data-cy="biometrics-print-tr-24">
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-date">Date</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-time-in">Time In</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-time-out">Time Out</th>
            <th className="border border-ink px-2 py-1.5 text-right" data-cy="biometrics-print-th-hours">Hours</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-remarks">Remarks</th>
          </tr>
        </thead>
        <tbody data-cy="biometrics-print-tbody-30">
          {sorted.map(r => <tr key={r.id} data-cy="biometrics-print-tr-31">
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-32">{r.date}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-33">{r.timeIn ?? '\u2014'}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-34">{r.timeOut ?? '\u2014'}</td>
              <td className="border border-ink px-2 py-1.5 text-right" data-cy="biometrics-print-td-h">{computeHoursRendered(r)}h</td>
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-36">
                {r.onLeave ? r.remarks || 'On Leave' : isRecordFlagged(r) ? missingPunchLabel(r) : r.remarks || '\u2014'}
              </td>
            </tr>)}
          {sorted.length === 0 && <tr data-cy="biometrics-print-tr-37">
              <td className="border border-ink px-2 py-4 text-center text-neutral-400" colSpan={5} data-cy="biometrics-print-td-no-records-in-range">No records in range.</td>
            </tr>}
        </tbody>
        <tfoot data-cy="biometrics-print-tfoot-39">
          <tr className="bg-neutral-100 font-semibold" data-cy="biometrics-print-tr-40">
            <td className="border border-ink px-2 py-1.5" colSpan={3} data-cy="biometrics-print-td-total">Total</td>
            <td className="border border-ink px-2 py-1.5 text-right" data-cy="biometrics-print-td-h-2">{totalHours}h</td>
            <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-43" />
          </tr>
        </tfoot>
      </table>

      <div className="mt-14 grid grid-cols-2 gap-10 text-xs" data-cy="biometrics-print-div-44">
        <div data-cy="biometrics-print-div-45"><div className="border-t border-ink pt-1.5" data-cy="biometrics-print-div-trainee-signature-over-printed-name">Trainee Signature over Printed Name</div></div>
        <div data-cy="biometrics-print-div-47"><div className="border-t border-ink pt-1.5" data-cy="biometrics-print-div-admin-signature-over-printed-name">Admin Signature over Printed Name</div></div>
      </div>
    </div>;
}