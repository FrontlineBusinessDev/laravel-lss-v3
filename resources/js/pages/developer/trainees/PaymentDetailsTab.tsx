import { useMemo, useState } from 'react'
import { Plus, Receipt } from 'lucide-react'
import type { Trainee, TraineePayment } from '@/types'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { TextField, SelectField } from '@/components/FormField'
import { StatCard } from '@/components/StatCard'

export function PaymentDetailsTab({ trainee }: { trainee: Trainee }) {
  const [payments, setPayments] = useState<TraineePayment[]>(trainee.payments)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({ amount: '', method: 'Bank transfer', reference: '' })

  const amountDue = trainee.totalAmount - trainee.totalDiscountAmount
  const amountPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments])
  const outstanding = Math.max(0, amountDue - amountPaid)

  const currency = (n: number) => `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`

  const handleRecord = () => {
    const amount = Number(form.amount)
    if (!amount) return
    setPayments((prev) => [
      ...prev,
      {
        id: `pay-${prev.length + 1}-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        amount,
        method: form.method,
        reference: form.reference || '—',
        receiptNo: `OR-${new Date().getFullYear()}-${String(prev.length + 1).padStart(4, '0')}`,
        recordedBy: 'Thea Ramirez',
      },
    ])
    setForm({ amount: '', method: 'Bank transfer', reference: '' })
    setModalOpen(false)
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5">
      <div className="mb-4 grid grid-cols-2 gap-2.5 lg:grid-cols-5">
        <StatCard label="Total amount" value={currency(trainee.totalAmount)} />
        <StatCard label="Discount" value={`${currency(trainee.totalDiscountAmount)} (${trainee.discountPercentage}%)`} />
        <StatCard label="Amount due" value={currency(amountDue)} />
        <StatCard label="Amount paid" value={currency(amountPaid)} tone="success" />
        <StatCard label="Outstanding balance" value={currency(outstanding)} tone={outstanding > 0 ? 'warning' : 'default'} />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">Payment history</h3>
        <Button variant="primary" size="sm" icon={Plus} onClick={() => setModalOpen(true)}>
          Record payment
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border border-neutral-200">
        <div className="overflow-x-auto lss-scrollbar">
          <table className="w-full min-w-[560px] border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                <th className="px-3.5 py-2.5 font-medium">Date</th>
                <th className="px-3.5 py-2.5 font-medium">Amount</th>
                <th className="px-3.5 py-2.5 font-medium">Method</th>
                <th className="px-3.5 py-2.5 font-medium">Reference</th>
                <th className="px-3.5 py-2.5 font-medium">Receipt no.</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-neutral-100">
                  <td className="px-3.5 py-2.5 text-neutral-600">{p.date}</td>
                  <td className="px-3.5 py-2.5 font-medium text-ink">{currency(p.amount)}</td>
                  <td className="px-3.5 py-2.5 text-neutral-600">{p.method}</td>
                  <td className="px-3.5 py-2.5 font-mono text-xs text-neutral-600">{p.reference}</td>
                  <td className="px-3.5 py-2.5">
                    <button className="flex items-center gap-1.5 text-xs font-medium text-brand-500 transition-colors hover:text-brand-600">
                      <Receipt size={13} />
                      {p.receiptNo}
                    </button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3.5 py-8 text-center text-sm text-neutral-500">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record payment" description="Log a new payment transaction for this trainee.">
        <TextField
          label="Amount"
          type="number"
          min={0}
          value={form.amount}
          onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
          placeholder="0.00"
        />
        <SelectField
          label="Payment method"
          options={['Bank transfer', 'GCash', 'Cash', 'Credit card', 'Check']}
          value={form.method}
          onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
        />
        <TextField
          label="Reference no."
          optional
          value={form.reference}
          onChange={(e) => setForm((f) => ({ ...f, reference: e.target.value }))}
          placeholder="e.g. REF-12345"
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleRecord}>
            Save payment
          </Button>
        </div>
      </Modal>
    </div>
  )
}
