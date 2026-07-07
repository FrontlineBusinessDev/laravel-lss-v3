import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextAreaField } from '@/components/FormField'
import { useBatches } from '@/context/BatchesContext'
import { useToast } from '@/components/Toast'
import { AlertTriangle } from 'lucide-react'
import type { Trainee } from '@/types'

export function TerminateTraineeModal({
  open,
  onClose,
  trainee,
}: {
  open: boolean
  onClose: () => void
  trainee: Trainee | null
}) {
  const { terminateTrainee } = useBatches()
  const { showToast } = useToast()
  const [remarks, setRemarks] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setRemarks('')
      setError('')
    }
  }, [open, trainee])

  if (!trainee) return null

  function handleTerminate() {
    if (!remarks.trim()) {
      setError('Please provide a remark explaining the termination.')
      return
    }
    terminateTrainee(trainee!.id, remarks.trim())
    showToast(`${trainee!.name} has been terminated.`, 'error')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Terminate trainee" maxWidth={420}>
      <div className="mb-4 flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-50 text-danger-600">
          <AlertTriangle size={17} />
        </div>
        <p className="pt-1 text-sm leading-relaxed text-neutral-600">
          <span className="font-medium text-ink">{trainee.name}</span> will be marked as terminated. Their record stays
          visible in the batch list, moved to the bottom, with the remark shown below.
        </p>
      </div>

      <TextAreaField
        label="Termination remarks"
        placeholder="e.g. Failed to meet attendance requirements"
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
      />
      {error && <p className="mb-2 text-xs font-medium text-danger-600">{error}</p>}

      <div className="mt-2 flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button
          className="flex-1 bg-danger-600 text-white border-danger-600 hover:bg-danger-700"
          onClick={handleTerminate}
        >
          Terminate trainee
        </Button>
      </div>
    </Modal>
  )
}
