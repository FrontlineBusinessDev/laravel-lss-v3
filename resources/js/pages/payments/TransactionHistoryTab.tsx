import { FileText, FileCheck2, Pencil, Plus } from 'lucide-react'
import type { Trainee, TraineePayment } from '@/types'
import { Button } from '@/components/Button'
import { TooltipIconButton } from '@/components/TooltipIconButton'
import { formatCurrency } from './paymentsUtils'

interface TransactionHistoryTabProps {
  trainee: Trainee
  onAddPayment: () => void
  onEditTransaction: (transaction: TraineePayment) => void
}

export function TransactionHistoryTab({ trainee, onAddPayment, onEditTransaction }: TransactionHistoryTabProps) {
  const sorted = [...trainee.payments].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Transaction history</h3>
        <Button variant="primary" size="sm" icon={Plus} onClick={onAddPayment}>
          Record payment
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border border-neutral-200">
        <div className="overflow-x-auto lss-scrollbar">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                <th className="px-3.5 py-2.5 font-medium">Date</th>
                <th className="px-3.5 py-2.5 font-medium">OR no.</th>
                <th className="px-3.5 py-2.5 font-medium">Amount paid</th>
                <th className="px-3.5 py-2.5 font-medium">Method</th>
                <th className="px-3.5 py-2.5 font-medium">Remarks</th>
                <th className="px-3.5 py-2.5 font-medium">Recorded by</th>
                <th className="px-3.5 py-2.5 font-medium">Documents</th>
                <th className="px-3.5 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id} className="border-t border-neutral-100">
                  <td className="px-3.5 py-2.5 font-mono text-xs text-neutral-600">{p.date}</td>
                  <td className="px-3.5 py-2.5 font-mono text-xs text-neutral-600">{p.receiptNo}</td>
                  <td className="px-3.5 py-2.5 font-medium text-ink">{formatCurrency(p.amount)}</td>
                  <td className="px-3.5 py-2.5 text-neutral-600">{p.method}</td>
                  <td className="px-3.5 py-2.5 max-w-[160px] truncate text-xs text-neutral-500" title={p.remarks}>
                    {p.remarks || '\u2014'}
                  </td>
                  <td className="px-3.5 py-2.5 text-xs text-neutral-500">{p.recordedBy}</td>
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-1">
                      {p.invoiceLink ? (
                        <a
                          href={p.invoiceLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-brand-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          title="View service invoice"
                        >
                          <FileText size={13} /> Invoice
                        </a>
                      ) : (
                        <span className="text-xs text-neutral-400">No invoice</span>
                      )}
                      {p.acknowledgementReceiptLink ? (
                        <a
                          href={p.acknowledgementReceiptLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-brand-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
                          title="View acknowledgement receipt"
                        >
                          <FileCheck2 size={13} /> A/R
                        </a>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <TooltipIconButton icon={Pencil} label="Edit transaction / attachments" onClick={() => onEditTransaction(p)} />
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3.5 py-8 text-center text-sm text-neutral-500">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
