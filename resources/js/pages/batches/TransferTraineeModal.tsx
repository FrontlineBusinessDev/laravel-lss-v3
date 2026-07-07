import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { SelectField, InfoNote } from '@/components/FormField'
import { useBatches } from '@/context/BatchesContext'
import { useToast } from '@/components/Toast'
import { Info } from 'lucide-react'
import type { Trainee } from '@/types'

export function TransferTraineeModal({
  open,
  onClose,
  trainee,
}: {
  open: boolean
  onClose: () => void
  trainee: Trainee | null
}) {
  const { batches, transferTrainee } = useBatches()
  const { showToast } = useToast()
  const [target, setTarget] = useState('')
  const [error, setError] = useState('')

  const options = batches.filter((b) => b.batchNo !== trainee?.batchNo && b.status !== 'dissolved' && b.status !== 'completed')

  useEffect(() => {
    if (open) {
      setTarget('')
      setError('')
    }
  }, [open, trainee])

  if (!trainee) return null

  function handleTransfer() {
    if (!target) {
      setError('Please select a destination batch.')
      return
    }
    transferTrainee(trainee!.id, target)
    showToast(`${trainee!.name} transferred to ${target}.`, 'success')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Transfer trainee" description={`Move ${trainee.name} to a different batch.`}>
      <InfoNote>
        <Info size={14} className="mt-0.5 shrink-0 text-neutral-400" />
        <span>
          Currently in <span className="font-medium text-ink">{trainee.batchNo}</span>. Progress and records will carry
          over to the new batch.
        </span>
      </InfoNote>

      <SelectField
        label="Destination batch"
        options={['Select a batch', ...options.map((b) => `${b.batchNo} — ${b.programType}`)]}
        value={target ? `${target} — ${options.find((b) => b.batchNo === target)?.programType ?? ''}` : 'Select a batch'}
        onChange={(e) => {
          const v = e.target.value
          if (v === 'Select a batch') {
            setTarget('')
          } else {
            setTarget(v.split(' — ')[0])
          }
        }}
      />
      {options.length === 0 && (
        <p className="mb-2 text-xs text-neutral-500">No other active batches are available to transfer into right now.</p>
      )}
      {error && <p className="mb-2 text-xs font-medium text-danger-600">{error}</p>}

      <div className="mt-5 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleTransfer} disabled={options.length === 0}>
          Transfer trainee
        </Button>
      </div>
    </Modal>
  )
}
