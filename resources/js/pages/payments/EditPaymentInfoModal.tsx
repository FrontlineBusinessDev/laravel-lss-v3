import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField, InfoNote } from '@/components/FormField'
import type { Trainee } from '@/types'
import { autoComputePaymentFields } from '@/data/mockData'
import { useBatches } from '@/context/BatchesContext'
import { formatCurrency } from './paymentsUtils'

export interface PaymentInfoFormValues {
  totalAmount: string
  discountPercentage: string
}

interface EditPaymentInfoModalProps {
  open: boolean
  trainee: Trainee | null
  onClose: () => void
  onSave: (values: { totalAmount: number; discountPercentage: number }) => void
}

export function EditPaymentInfoModal({ open, trainee, onClose, onSave }: EditPaymentInfoModalProps) {
  const { trainees: allTrainees } = useBatches()
  const [values, setValues] = useState<PaymentInfoFormValues>({ totalAmount: '', discountPercentage: '' })

  useEffect(() => {
    if (open && trainee) {
      setValues({ totalAmount: String(trainee.totalAmount), discountPercentage: String(trainee.discountPercentage) })
    }
  }, [open, trainee])

  if (!trainee) return null

  const totalAmount = Number(values.totalAmount) || 0
  const discountPercentage = Number(values.discountPercentage) || 0
  const discountAmount = Math.round((totalAmount * discountPercentage) / 100)
  const netDue = Math.max(0, totalAmount - discountAmount)

  function applyAutoCompute() {
    if (!trainee) return
    const auto = autoComputePaymentFields(trainee, allTrainees)
    setValues({ totalAmount: String(auto.totalAmount), discountPercentage: String(auto.discountPercentage) })
  }

  const canSave = totalAmount >= 0 && discountPercentage >= 0 && discountPercentage <= 100

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit payment information"
      description={`Adjust ${trainee.name}'s total amount or discount. Changes are recorded for auditing.`}
      maxWidth={440}
    >
      <InfoNote>
        Auto-computed default: school volume rate × {trainee.requiredHrs} required hours, with the school's agreed
        discount applied. Use "Recompute automatically" to reset to that default, or override the figures below when authorized.
      </InfoNote>

      <div className="mb-3.5 flex justify-end">
        <Button variant="secondary" size="sm" icon={RefreshCw} onClick={applyAutoCompute}>
          Recompute automatically
        </Button>
      </div>

      <TextField
        label="Total amount"
        type="number"
        min={0}
        step="0.01"
        value={values.totalAmount}
        onChange={(e) => setValues((v) => ({ ...v, totalAmount: e.target.value }))}
      />
      <TextField
        label="Discount percentage"
        type="number"
        min={0}
        max={100}
        step="0.01"
        value={values.discountPercentage}
        onChange={(e) => setValues((v) => ({ ...v, discountPercentage: e.target.value }))}
      />

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-md bg-neutral-50 p-3 text-xs text-neutral-600">
        <div>
          Discount amount: <span className="font-medium text-ink">{formatCurrency(discountAmount)}</span>
        </div>
        <div>
          Net amount due: <span className="font-medium text-ink">{formatCurrency(netDue)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" disabled={!canSave} onClick={() => onSave({ totalAmount, discountPercentage })}>
          Save changes
        </Button>
      </div>
    </Modal>
  )
}
