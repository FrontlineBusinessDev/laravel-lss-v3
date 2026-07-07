import { LogoMark } from '@/components/Logo'
import type { Trainee } from '@/types'
import { computePaymentBreakdown } from '@/data/mockData'
import { formatCurrency } from './paymentsUtils'

interface PaymentReportPrintProps {
  trainee: Trainee
  generatedAt: string
  variant?: 'print' | 'preview'
}

export function PaymentReportPrint({ trainee, generatedAt, variant = 'print' }: PaymentReportPrintProps) {
  const breakdown = computePaymentBreakdown(trainee)
  const sorted = [...trainee.payments].sort((a, b) => (a.date < b.date ? -1 : 1))
  const wrapperClass =
    variant === 'print' ? 'hidden print:block print-area bg-white p-8 text-ink' : 'bg-white p-6 text-ink border border-neutral-200 rounded-lg'

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
          <div className="text-base font-bold">Payment Report</div>
          <div className="text-[10px] text-neutral-500">Generated {generatedAt}</div>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
        <div><span className="font-semibold">Full Name:</span> {trainee.name}</div>
        <div><span className="font-semibold">School:</span> {trainee.school}</div>
        <div><span className="font-semibold">Batch:</span> {trainee.batchNo}</div>
        <div><span className="font-semibold">Payment Status:</span> {breakdown.status}</div>
      </div>

      <table className="mb-5 w-full border-collapse text-[11px]">
        <tbody>
          <tr>
            <td className="border border-ink px-2 py-1.5 font-semibold">Total amount</td>
            <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(breakdown.totalAmount)}</td>
            <td className="border border-ink px-2 py-1.5 font-semibold">Total amount paid</td>
            <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(breakdown.totalAmountPaid)}</td>
          </tr>
          <tr>
            <td className="border border-ink px-2 py-1.5 font-semibold">Discount ({breakdown.discountPercentage}%)</td>
            <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(breakdown.totalDiscountAmount)}</td>
            <td className="border border-ink px-2 py-1.5 font-semibold">Outstanding balance</td>
            <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(Math.max(0, breakdown.outstandingBalance))}</td>
          </tr>
          <tr>
            <td className="border border-ink px-2 py-1.5 font-semibold">Net amount due</td>
            <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(breakdown.netAmountDue)}</td>
            <td className="border border-ink px-2 py-1.5" colSpan={2} />
          </tr>
        </tbody>
      </table>

      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="border border-ink bg-neutral-100">
            <th className="border border-ink px-2 py-1.5 text-left">Date</th>
            <th className="border border-ink px-2 py-1.5 text-left">OR No.</th>
            <th className="border border-ink px-2 py-1.5 text-right">Amount Paid</th>
            <th className="border border-ink px-2 py-1.5 text-left">Method</th>
            <th className="border border-ink px-2 py-1.5 text-left">Remarks</th>
            <th className="border border-ink px-2 py-1.5 text-left">Recorded By</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id}>
              <td className="border border-ink px-2 py-1.5">{p.date}</td>
              <td className="border border-ink px-2 py-1.5">{p.receiptNo}</td>
              <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(p.amount)}</td>
              <td className="border border-ink px-2 py-1.5">{p.method}</td>
              <td className="border border-ink px-2 py-1.5">{p.remarks || '\u2014'}</td>
              <td className="border border-ink px-2 py-1.5">{p.recordedBy}</td>
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td className="border border-ink px-2 py-4 text-center text-neutral-400" colSpan={6}>No transactions recorded.</td>
            </tr>
          )}
        </tbody>
        <tfoot>
          <tr className="bg-neutral-100 font-semibold">
            <td className="border border-ink px-2 py-1.5" colSpan={2}>Total</td>
            <td className="border border-ink px-2 py-1.5 text-right">{formatCurrency(breakdown.totalAmountPaid)}</td>
            <td className="border border-ink px-2 py-1.5" colSpan={3} />
          </tr>
        </tfoot>
      </table>

      <div className="mt-14 grid grid-cols-2 gap-10 text-xs">
        <div><div className="border-t border-ink pt-1.5">Trainee Signature over Printed Name</div></div>
        <div><div className="border-t border-ink pt-1.5">Finance Signature over Printed Name</div></div>
      </div>
    </div>
  )
}
