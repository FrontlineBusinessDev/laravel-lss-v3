import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField, SelectField, TextAreaField } from '@/components/FormField'
import type { AcademicLevel } from '@/types'

const LEVELS = ['College', 'Senior high school', 'Vocational']

export interface AcademicLevelFormValues {
  level: string
  yearLevel: string
  description: string
}

interface AddAcademicLevelModalProps {
  open: boolean
  onClose: () => void
  onSave: (values: AcademicLevelFormValues) => void
  initial?: AcademicLevel | null
}

const EMPTY: AcademicLevelFormValues = { level: LEVELS[0], yearLevel: '', description: '' }

export function AddAcademicLevelModal({ open, onClose, onSave, initial }: AddAcademicLevelModalProps) {
  const isEdit = !!initial
  const [values, setValues] = useState<AcademicLevelFormValues>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValues(initial ? { level: initial.level, yearLevel: initial.yearLevel, description: initial.description } : EMPTY)
      setError('')
    }
  }, [open, initial])

  function handleSubmit() {
    if (!values.yearLevel.trim()) {
      setError('Year level is required.')
      return
    }
    onSave(values)
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit academic level' : 'Add academic level'} maxWidth={400}>
      <SelectField label="Academic level" options={LEVELS} value={values.level} onChange={(e) => setValues((v) => ({ ...v, level: e.target.value }))} />
      <TextField
        label="Year level"
        placeholder="e.g. 3rd year, Grade 12"
        value={values.yearLevel}
        onChange={(e) => {
          setValues((v) => ({ ...v, yearLevel: e.target.value }))
          setError('')
        }}
      />
      {error && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{error}</p>}
      <TextAreaField
        label="Description"
        optional
        placeholder="Notes about this level..."
        value={values.description}
        onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
      />

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Add level'}
        </Button>
      </div>
    </Modal>
  )
}
