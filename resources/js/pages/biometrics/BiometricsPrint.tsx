import { LogoMark } from '@/components/Logo'
import { computeHoursRendered, isRecordFlagged } from '@/data/mockData'
import { missingPunchLabel, summarizeAttendance } from '@/pages/biometrics/biometricsUtils'
import type { BiometricRecord, Trainee } from '@/types'

interface BiometricsPrintProps {
  trainee: Pick<Trainee, 'name' | 'school' | 'batchNo'>
  records: BiometricRecord[]
  totalHours: number
  generatedAt: string
  /** 'print' (default): hidden on screen, shown only in the print media query.
   *  'preview': always visible, for showing the exact printable layout inside an on-screen modal. */
  variant?: 'print' | 'preview'
}

/**
 * Per-trainee attendance report, shared between the hidden print layout and
 * the on-screen "preview before printing" modal so both are guaranteed to
 * look identical.
 */
export function BiometricsPrint({ trainee, records, totalHours, generatedAt, variant = 'print' }: BiometricsPrintProps) {
  const sorted = [...records].sort((a, b) => (a.date < b.date ? -1 : 1))
  const wrapperClass = variant === 'print' ? 'hidden print:block print-area bg-white p-8 text-ink' : 'bg-white p-6 text-ink border border-neutral-200 rounded-lg'

  return (
    <div className={wrapperClass}>
      <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4">
        <div className="flex items-center gap-3">
          <LogoMark size={38} />
          <div>
            <div className="text-sm font-bold tracking-wide">FRONTLINE BUSINESS SOLUTIONS</div>
            <div className="text-[10px] text-neutral-500">Learning Solutions System</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-base font-bold">Biometrics / Attendance Report</div>
          <div className="text-[10px] text-neutral-500">Generated {generatedAt}</div>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
        <div><span className="font-semibold">Full Name:</span> {trainee.name}</div>
        <div><span className="font-semibold">School:</span> {trainee.school}</div>
        <div><span className="font-semibold">Batch:</span> {trainee.batchNo}</div>
        <div><span className="font-semibold">Total Training Hours:</span> {totalHours}h</div>
        <div className="col-span-2"><span className="font-semibold">Remarks:</span> {summarizeAttendance(records)}</div>
      </div>

      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border border-ink bg-neutral-100">
            <th className="border border-ink px-2 py-1.5 text-left">Date</th>
            <th className="border border-ink px-2 py-1.5 text-left">Time In</th>
            <th className="border border-ink px-2 py-1.5 text-left">Time Out</th>
            <th className="border border-ink px-2 py-1.5 text-right">Hours</th>
            <th className="border border-ink px-2 py-1.5 text-left">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.id}>
              <td className="border border-ink px-2 py-1.5">{r.date}</td>
              <td className="border border-ink px-2 py-1.5">{r.timeIn ?? '\u2014'}</td>
              <td className="border border-ink px-2 py-1.5">{r.timeOut ?? '\u2014'}</td>
              <td className="border border-ink px-2 py-1.5 text-right">{computeHoursRendered(r)}h</td>
              <td className="border border-ink px-2 py-1.5">
                {r.onLeave ? (r.remarks || 'On Leave') : isRecordFlagged(r) ? missingPunchLabel(r) : r.remarks || '\u2014'}
              </td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td className="border border-ink px-2 py-4 text-center text-neutral-400" colSpan={5}>No records in range.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-neutral-100 font-semibold">
            <td className="border border-ink px-2 py-1.5" colSpan={3}>Total</td>
            <td className="border border-ink px-2 py-1.5 text-right">{totalHours}h</td>
            <td className="border border-ink px-2 py-1.5" />
          </tr>
        </tfoot>
      </table>

      <div className="mt-14 grid grid-cols-2 gap-10 text-xs">
        <div><div className="border-t border-ink pt-1.5">Trainee Signature over Printed Name</div></div>
        <div><div className="border-t border-ink pt-1.5">Admin Signature over Printed Name</div></div>
      </div>
    </div>
  )
}
