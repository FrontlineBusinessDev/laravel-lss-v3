import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField, SelectField } from '@/components/FormField'
import type { AcademicProgram } from '@/types'

const PROGRAMS = ['Information technology', 'Accountancy', 'Hospitality management', 'Marketing', 'Engineering']

export interface AcademicProgramFormValues {
  program: string
  course: string
  specialization: string
}

interface AddAcademicProgramModalProps {
  open: boolean
  onClose: () => void
  onSave: (values: AcademicProgramFormValues) => void
  initial?: AcademicProgram | null
}

const EMPTY: AcademicProgramFormValues = { program: PROGRAMS[0], course: '', specialization: '' }

export function AddAcademicProgramModal({ open, onClose, onSave, initial }: AddAcademicProgramModalProps) {
  const isEdit = !!initial
  const [values, setValues] = useState<AcademicProgramFormValues>(EMPTY)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setValues(initial ? { program: initial.program, course: initial.course, specialization: initial.specialization } : EMPTY)
      setError('')
    }
  }, [open, initial])

  function handleSubmit() {
    if (!values.course.trim()) {
      setError('Course is required.')
      return
    }
    onSave(values)
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit academic program' : 'Add academic program'} maxWidth={400}>
      <SelectField label="Program" options={PROGRAMS} value={values.program} onChange={(e) => setValues((v) => ({ ...v, program: e.target.value }))} />
      <TextField
        label="Course"
        placeholder="e.g. BS Computer Science"
        value={values.course}
        onChange={(e) => {
          setValues((v) => ({ ...v, course: e.target.value }))
          setError('')
        }}
      />
      {error && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{error}</p>}
      <TextField
        label="Specialization"
        optional
        placeholder="e.g. Software engineering"
        value={values.specialization}
        onChange={(e) => setValues((v) => ({ ...v, specialization: e.target.value }))}
      />

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit}>
          {isEdit ? 'Save changes' : 'Add program'}
        </Button>
      </div>
    </Modal>
  )
}
