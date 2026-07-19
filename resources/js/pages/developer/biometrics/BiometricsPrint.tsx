import { LogoMark } from '@/components/Logo';
import { summarizeAttendance } from '@/pages/developer/biometrics/biometricsUtils';
interface PrintRow {
  id: number | string;
  date: string;
  morning_time_in: string | null;
  lunch_time_out: string | null;
  afternoon_time_in: string | null;
  day_time_out: string | null;
  on_leave: boolean;
  remarks: string | null;
  total_hours: number;
  exceptions: string[];
}
interface BiometricsPrintProps {
  trainee: { name: string; school?: string; batchCode: string };
  records: PrintRow[];
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
        {trainee.school && <div data-cy="biometrics-print-div-14"><span className="font-semibold" data-cy="biometrics-print-span-school">School:</span> {trainee.school}</div>}
        <div data-cy="biometrics-print-div-16"><span className="font-semibold" data-cy="biometrics-print-span-batch">Batch:</span> {trainee.batchCode}</div>
        <div data-cy="biometrics-print-div-h"><span className="font-semibold" data-cy="biometrics-print-span-total-training-hours">Total Training Hours:</span> {totalHours}h</div>
        <div className="col-span-2" data-cy="biometrics-print-div-20"><span className="font-semibold" data-cy="biometrics-print-span-remarks">Remarks:</span> {summarizeAttendance(records)}</div>
      </div>

      <table className="w-full border-collapse text-[11px]" data-cy="biometrics-print-table-22">
        <thead data-cy="biometrics-print-thead-23">
          <tr className="border border-ink bg-neutral-100" data-cy="biometrics-print-tr-24">
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-date">Date</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-morning-in">Morning Time In</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-lunch-out">Lunch Out</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-afternoon-in">After Lunch Time In</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-day-out">Day Time Out</th>
            <th className="border border-ink px-2 py-1.5 text-right" data-cy="biometrics-print-th-hours">Hours</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="biometrics-print-th-remarks">Remarks</th>
          </tr>
        </thead>
        <tbody data-cy="biometrics-print-tbody-30">
          {sorted.map(r => <tr key={r.id} data-cy="biometrics-print-tr-31">
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-32">{r.date}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-33">{r.morning_time_in ?? '—'}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-lunch">{r.lunch_time_out ?? '—'}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-afternoon">{r.afternoon_time_in ?? '—'}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-34">{r.day_time_out ?? '—'}</td>
              <td className="border border-ink px-2 py-1.5 text-right" data-cy="biometrics-print-td-h">{r.total_hours}h</td>
              <td className="border border-ink px-2 py-1.5" data-cy="biometrics-print-td-36">
                {r.on_leave ? r.remarks || 'On Leave' : r.exceptions.length > 0 ? r.exceptions.join(', ') : r.remarks || '—'}
              </td>
            </tr>)}
          {sorted.length === 0 && <tr data-cy="biometrics-print-tr-37">
              <td className="border border-ink px-2 py-4 text-center text-neutral-400" colSpan={7} data-cy="biometrics-print-td-no-records-in-range">No records in range.</td>
            </tr>}
        </tbody>
        <tfoot data-cy="biometrics-print-tfoot-39">
          <tr className="bg-neutral-100 font-semibold" data-cy="biometrics-print-tr-40">
            <td className="border border-ink px-2 py-1.5" colSpan={5} data-cy="biometrics-print-td-total">Total</td>
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
