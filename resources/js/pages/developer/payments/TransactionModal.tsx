import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField, SelectField, TextAreaField, InfoNote } from '@/components/FormField'
import type { Trainee, TraineePayment } from '@/types'
import { nextReceiptNumber } from './paymentsUtils'
import { TODAY, currentUser } from '@/data/mockData'
import { useBatches } from '@/context/BatchesContext'

export interface TransactionFormValues {
  date: string
  amount: string
  method: string
  reference: string
  receiptNo: string
  remarks: string
  invoiceLink: string
  acknowledgementReceiptLink: string
}

const EMPTY: TransactionFormValues = {
  date: '',
  amount: '',
  method: 'Bank transfer',
  reference: '',
  receiptNo: '',
  remarks: '',
  invoiceLink: '',
  acknowledgementReceiptLink: '',
}

interface TransactionModalProps {
  open: boolean
  mode: 'add' | 'edit'
  trainee: Trainee | null
  editingTransaction?: TraineePayment | null
  onClose: () => void
  onSave: (values: TransactionFormValues) => void
}

export function TransactionModal({ open, mode, trainee, editingTransaction, onClose, onSave }: TransactionModalProps) {
  const { trainees: allTrainees } = useBatches()
  const [values, setValues] = useState<TransactionFormValues>(EMPTY)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && editingTransaction) {
      setValues({
        date: editingTransaction.date,
        amount: String(editingTransaction.amount),
        method: editingTransaction.method,
        reference: editingTransaction.reference,
        receiptNo: editingTransaction.receiptNo,
        remarks: editingTransaction.remarks ?? '',
        invoiceLink: editingTransaction.invoiceLink ?? '',
        acknowledgementReceiptLink: editingTransaction.acknowledgementReceiptLink ?? '',
      })
    } else {
      setValues({
        ...EMPTY,
        date: TODAY.toISOString().slice(0, 10),
        receiptNo: nextReceiptNumber(allTrainees, TODAY.getFullYear()),
      })
    }
  }, [open, mode, editingTransaction])

  function set<K extends keyof TransactionFormValues>(key: K, val: TransactionFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }))
  }

  const amountValid = Number(values.amount) > 0
  const canSave = amountValid && !!values.date && !!values.receiptNo.trim()

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'add' ? 'Record payment transaction' : 'Edit payment transaction'}
      description={trainee ? `${mode === 'add' ? 'Logging a new payment' : 'Editing transaction'} for ${trainee.name}` : undefined}
      maxWidth={480}
    >
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Transaction date" type="date" value={values.date} onChange={(e) => set('date', e.target.value)} />
        <TextField
          label="Amount paid"
          type="number"
          min={0}
          step="0.01"
          value={values.amount}
          onChange={(e) => set('amount', e.target.value)}
          placeholder="0.00"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SelectField
          label="Payment method"
          options={['Bank transfer', 'GCash', 'Cash', 'Credit card', 'Check']}
          value={values.method}
          onChange={(e) => set('method', e.target.value)}
        />
        <TextField
          label="Official receipt no."
          value={values.receiptNo}
          onChange={(e) => set('receiptNo', e.target.value)}
          placeholder="e.g. OR-2026-0201"
        />
      </div>

      <TextField
        label="Reference no."
        optional
        value={values.reference}
        onChange={(e) => set('reference', e.target.value)}
        placeholder="e.g. REF-12345"
      />

      <TextAreaField
        label="Remarks"
        optional
        value={values.remarks}
        onChange={(e) => set('remarks', e.target.value)}
        placeholder="Optional note for this transaction..."
      />

      <TextField
        label="Service invoice link"
        optional
        value={values.invoiceLink}
        onChange={(e) => set('invoiceLink', e.target.value)}
        placeholder="https://drive.example.com/..."
      />
      <TextField
        label="Acknowledgement receipt link"
        optional
        value={values.acknowledgementReceiptLink}
        onChange={(e) => set('acknowledgementReceiptLink', e.target.value)}
        placeholder="https://drive.example.com/..."
      />

      <InfoNote>
        Recorded by <span className="font-medium text-neutral-700">{currentUser.name}</span> on {TODAY.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.
      </InfoNote>

      <div className="mt-1 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" disabled={!canSave} onClick={() => onSave(values)}>
          {mode === 'add' ? 'Save transaction' : 'Save changes'}
        </Button>
      </div>
    </Modal>
  )
}
