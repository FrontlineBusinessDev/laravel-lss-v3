import { LogoMark } from '@/components/Logo';
import type { Trainee } from '@/types';
import { computePaymentBreakdown } from '@/data/mockData';
import { formatCurrency } from './paymentsUtils';
interface PaymentReportPrintProps {
  trainee: Trainee;
  generatedAt: string;
  variant?: 'print' | 'preview';
}
export function PaymentReportPrint({
  trainee,
  generatedAt,
  variant = 'print'
}: PaymentReportPrintProps) {
  const breakdown = computePaymentBreakdown(trainee);
  const sorted = [...trainee.payments].sort((a, b) => a.date < b.date ? -1 : 1);
  const wrapperClass = variant === 'print' ? 'hidden print:block print-area bg-white p-8 text-ink' : 'bg-white p-6 text-ink border border-neutral-200 rounded-lg';
  return <div className={wrapperClass} data-cy="payment-report-print-div-1">
      <header className="mb-5 flex items-center justify-between border-b-2 border-ink pb-4" data-cy="payment-report-print-header-2">
        <div className="flex items-center gap-3" data-cy="payment-report-print-div-3">
          <LogoMark size={38} data-cy="payment-report-print-logo-mark-4" />
          <div data-cy="payment-report-print-div-5">
            <div className="text-sm font-bold tracking-wide" data-cy="payment-report-print-div-frontline-business-solutions">FRONTLINE BUSINESS SOLUTIONS</div>
            <div className="text-[10px] text-neutral-500" data-cy="payment-report-print-div-learning-solutions-system">Learning Solutions System</div>
          </div>
        </div>
        <div className="text-right" data-cy="payment-report-print-div-8">
          <div className="text-base font-bold" data-cy="payment-report-print-div-payment-report">Payment Report</div>
          <div className="text-[10px] text-neutral-500" data-cy="payment-report-print-div-generated">Generated {generatedAt}</div>
        </div>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs" data-cy="payment-report-print-div-11">
        <div data-cy="payment-report-print-div-12"><span className="font-semibold" data-cy="payment-report-print-span-full-name">Full Name:</span> {trainee.name}</div>
        <div data-cy="payment-report-print-div-14"><span className="font-semibold" data-cy="payment-report-print-span-school">School:</span> {trainee.school}</div>
        <div data-cy="payment-report-print-div-16"><span className="font-semibold" data-cy="payment-report-print-span-batch">Batch:</span> {trainee.batchNo}</div>
        <div data-cy="payment-report-print-div-18"><span className="font-semibold" data-cy="payment-report-print-span-payment-status">Payment Status:</span> {breakdown.status}</div>
      </div>

      <table className="mb-5 w-full border-collapse text-[11px]" data-cy="payment-report-print-table-20">
        <tbody data-cy="payment-report-print-tbody-21">
          <tr data-cy="payment-report-print-tr-22">
            <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="payment-report-print-td-total-amount">Total amount</td>
            <td className="border border-ink px-2 py-1.5 text-right" data-cy="payment-report-print-td-24">{formatCurrency(breakdown.totalAmount)}</td>
            <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="payment-report-print-td-total-amount-paid">Total amount paid</td>
            <td className="border border-ink px-2 py-1.5 text-right" data-cy="payment-report-print-td-26">{formatCurrency(breakdown.totalAmountPaid)}</td>
          </tr>
          <tr data-cy="payment-report-print-tr-27">
            <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="payment-report-print-td-discount">Discount ({breakdown.discountPercentage}%)</td>
            <td className="border border-ink px-2 py-1.5 text-right" data-cy="payment-report-print-td-29">{formatCurrency(breakdown.totalDiscountAmount)}</td>
            <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="payment-report-print-td-outstanding-balance">Outstanding balance</td>
            <td className="border border-ink px-2 py-1.5 text-right" data-cy="payment-report-print-td-31">{formatCurrency(Math.max(0, breakdown.outstandingBalance))}</td>
          </tr>
          <tr data-cy="payment-report-print-tr-32">
            <td className="border border-ink px-2 py-1.5 font-semibold" data-cy="payment-report-print-td-net-amount-due">Net amount due</td>
            <td className="border border-ink px-2 py-1.5 text-right" data-cy="payment-report-print-td-34">{formatCurrency(breakdown.netAmountDue)}</td>
            <td className="border border-ink px-2 py-1.5" colSpan={2} data-cy="payment-report-print-td-35" />
          </tr>
        </tbody>
      </table>

      <table className="w-full border-collapse text-[11px]" data-cy="payment-report-print-table-36">
        <thead data-cy="payment-report-print-thead-37">
          <tr className="border border-ink bg-neutral-100" data-cy="payment-report-print-tr-38">
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="payment-report-print-th-date">Date</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="payment-report-print-th-or-no">OR No.</th>
            <th className="border border-ink px-2 py-1.5 text-right" data-cy="payment-report-print-th-amount-paid">Amount Paid</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="payment-report-print-th-method">Method</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="payment-report-print-th-remarks">Remarks</th>
            <th className="border border-ink px-2 py-1.5 text-left" data-cy="payment-report-print-th-recorded-by">Recorded By</th>
          </tr>
        </thead>
        <tbody data-cy="payment-report-print-tbody-45">
          {sorted.map(p => <tr key={p.id} data-cy="payment-report-print-tr-46">
              <td className="border border-ink px-2 py-1.5" data-cy="payment-report-print-td-47">{p.date}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="payment-report-print-td-48">{p.receiptNo}</td>
              <td className="border border-ink px-2 py-1.5 text-right" data-cy="payment-report-print-td-49">{formatCurrency(p.amount)}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="payment-report-print-td-50">{p.method}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="payment-report-print-td-51">{p.remarks || '\u2014'}</td>
              <td className="border border-ink px-2 py-1.5" data-cy="payment-report-print-td-52">{p.recordedBy}</td>
            </tr>)}
          {sorted.length === 0 && <tr data-cy="payment-report-print-tr-53">
              <td className="border border-ink px-2 py-4 text-center text-neutral-400" colSpan={6} data-cy="payment-report-print-td-no-transactions-recorded">No transactions recorded.</td>
            </tr>}
        </tbody>
        <tfoot data-cy="payment-report-print-tfoot-55">
          <tr className="bg-neutral-100 font-semibold" data-cy="payment-report-print-tr-56">
            <td className="border border-ink px-2 py-1.5" colSpan={2} data-cy="payment-report-print-td-total">Total</td>
            <td className="border border-ink px-2 py-1.5 text-right" data-cy="payment-report-print-td-58">{formatCurrency(breakdown.totalAmountPaid)}</td>
            <td className="border border-ink px-2 py-1.5" colSpan={3} data-cy="payment-report-print-td-59" />
          </tr>
        </tfoot>
      </table>

      <div className="mt-14 grid grid-cols-2 gap-10 text-xs" data-cy="payment-report-print-div-60">
        <div data-cy="payment-report-print-div-61"><div className="border-t border-ink pt-1.5" data-cy="payment-report-print-div-trainee-signature-over-printed-name">Trainee Signature over Printed Name</div></div>
        <div data-cy="payment-report-print-div-63"><div className="border-t border-ink pt-1.5" data-cy="payment-report-print-div-finance-signature-over-printed-name">Finance Signature over Printed Name</div></div>
      </div>
    </div>;
}