import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Printer } from 'lucide-react'
import type { Trainee, TraineePayment } from '@/types'
import { Button } from '@/components/Button'
import { cn } from '@/lib/utils'
import { PaymentInfoTab } from './PaymentInfoTab'
import { TransactionHistoryTab } from './TransactionHistoryTab'
import { PaymentReportPrint } from './PaymentReportPrint'

const TABS = ['Payment information', 'Transaction history'] as const
type Tab = (typeof TABS)[number]

interface PaymentDetailModalProps {
  trainee: Trainee | null
  onClose: () => void
  onEditPaymentInfo: () => void
  onAddPayment: () => void
  onEditTransaction: (transaction: TraineePayment) => void
}

export function PaymentDetailModal({ trainee, onClose, onEditPaymentInfo, onAddPayment, onEditTransaction }: PaymentDetailModalProps) {
  const [tab, setTab] = useState<Tab>('Payment information')
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false)

  if (!trainee) return null

  const generatedAt = new Date().toLocaleString('en-PH', { dateStyle: 'medium', timeStyle: 'short' })

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/45 p-4 animate-fadeIn sm:items-center no-print"
        onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          role="dialog"
          aria-modal="true"
          className="my-4 w-full max-w-[720px] rounded-lg bg-white p-6 shadow-modal animate-scaleIn"
        >
          <div className="mb-1 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-ink">{trainee.name}</h2>
              <p className="text-xs text-neutral-500">
                {trainee.school} \u00b7 {trainee.batchNo}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="secondary" size="sm" icon={Printer} onClick={() => setPrintPreviewOpen(true)}>
                Print report
              </Button>
              <button
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-sm p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="mb-4 mt-3 flex gap-5 border-b border-neutral-200">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'pb-2.5 text-xs font-medium transition-colors',
                  tab === t ? 'border-b-2 border-brand-500 text-ink font-semibold' : 'text-neutral-500 hover:text-neutral-700',
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === 'Payment information' && <PaymentInfoTab trainee={trainee} onEdit={onEditPaymentInfo} />}
          {tab === 'Transaction history' && (
            <TransactionHistoryTab trainee={trainee} onAddPayment={onAddPayment} onEditTransaction={onEditTransaction} />
          )}
        </div>
      </div>

      {/* Print preview */}
      {printPreviewOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/45 p-4 animate-fadeIn no-print"
          onMouseDown={(e) => e.target === e.currentTarget && setPrintPreviewOpen(false)}
        >
          <div className="max-h-[90vh] w-full max-w-[640px] overflow-y-auto rounded-lg bg-white p-6 shadow-modal animate-scaleIn lss-scrollbar">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold text-ink">Print preview</h2>
              <button
                onClick={() => setPrintPreviewOpen(false)}
                aria-label="Close dialog"
                className="rounded-sm p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
              >
                <X size={18} />
              </button>
            </div>
            <PaymentReportPrint variant="preview" trainee={trainee} generatedAt={generatedAt} />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" icon={X} onClick={() => setPrintPreviewOpen(false)}>
                Close
              </Button>
              <Button variant="primary" icon={Printer} onClick={() => window.print()}>
                Print
              </Button>
            </div>
          </div>
        </div>
      )}

      {printPreviewOpen && <PaymentReportPrint variant="print" trainee={trainee} generatedAt={generatedAt} />}
    </>,
    document.body,
  )
}
