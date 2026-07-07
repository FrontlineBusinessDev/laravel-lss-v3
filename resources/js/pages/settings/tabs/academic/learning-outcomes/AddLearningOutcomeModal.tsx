import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { SelectField, TextAreaField } from '@/components/FormField'
import type { LearningOutcome } from '@/types'

const INDUSTRIES = ['Information technology', 'Accounting', 'Hospitality', 'Marketing', 'Engineering']

export interface LearningOutcomeFormValues {
  industry: string
  outcome: string
}

interface AddLearningOutcomeModalProps {
  open: boolean
  onClose: () => void
  onSave: (values: LearningOutcomeFormValues) => void
  initial?: LearningOutcome | null
}

const EMPTY: LearningOutcomeFormValues = { industry: INDUSTRIES[0], outcome: '' }

export function AddLearningOutcomeModal({ open, onClose, onSave, initial }: AddLearningOutcomeModalProps) {
  const isEdit = !!initial
  const [values, setValues] = useState<LearningOutcomeFormValues>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValues(initial ? { industry: initial.industry, outcome: initial.outcome } : EMPTY)
      setError('')
    }
  }, [open, initial])

  function handleSubmit() {
    if (!values.outcome.trim()) {
      setError('Learning outcome is required.')
      return
    }
    onSave(values)
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit learning outcome' : 'Add learning outcome'} maxWidth={400}>
      <SelectField label="Industry" options={INDUSTRIES} value={values.industry} onChange={(e) => setValues((v) => ({ ...v, industry: e.target.value }))} />
      <TextAreaField
        label="Learning outcome"
        placeholder="e.g. Able to configure and troubleshoot local area networks"
        rows={4}
        value={values.outcome}
        onChange={(e) => {
          setValues((v) => ({ ...v, outcome: e.target.value }))
          setError('')
        }}
      />
      {error && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{error}</p>}

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Add outcome'}
        </Button>
      </div>
    </Modal>
  )
}
