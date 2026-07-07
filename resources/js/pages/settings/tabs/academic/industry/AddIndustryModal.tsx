import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField } from '@/components/FormField'
import { MultiSelectDropdown } from '@/components/MultiSelectDropdown'
import type { Industry } from '@/types'

import { PROGRAM_TYPES } from '@/lib/constants'

export interface IndustryFormValues {
  name: string
  matchedPrograms: string[]
}

interface AddIndustryModalProps {
  open: boolean
  onClose: () => void
  onSave: (values: IndustryFormValues) => void
  initial?: Industry | null
}

const EMPTY: IndustryFormValues = { name: '', matchedPrograms: [] }

export function AddIndustryModal({ open, onClose, onSave, initial }: AddIndustryModalProps) {
  const isEdit = !!initial
  const [values, setValues] = useState<IndustryFormValues>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValues(initial ? { name: initial.name, matchedPrograms: initial.matchedPrograms } : EMPTY)
      setError('')
    }
  }, [open, initial])

  function handleSubmit() {
    if (!values.name.trim()) {
      setError('Industry name is required.')
      return
    }
    onSave(values)
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit industry' : 'Add industry'} maxWidth={420}>
      <TextField
        label="Industry name"
        placeholder="e.g. Information technology"
        value={values.name}
        onChange={(e) => {
          setValues((v) => ({ ...v, name: e.target.value }))
          setError('')
        }}
      />
      {error && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{error}</p>}

      <div className="mb-3.5">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">
          Matched program types <span className="font-normal text-neutral-400">(optional)</span>
        </label>
        <MultiSelectDropdown
          options={PROGRAM_TYPES}
          value={values.matchedPrograms}
          placeholder="Select program types"
          onChange={(v) => setValues((prev) => ({ ...prev, matchedPrograms: v }))}
        />
        <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-400">
          Trainees are matched to this industry when their program type is on this list.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Add industry'}
        </Button>
      </div>
    </Modal>
  )
}
