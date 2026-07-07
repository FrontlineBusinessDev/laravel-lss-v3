import { useEffect, useMemo, useState } from 'react'
import { Info } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField, TextAreaField, SelectField, InfoNote } from '@/components/FormField'
import { MultiSelectDropdown } from '@/components/MultiSelectDropdown'
import type { AnnouncementAudience, Trainee } from '@/types'

const AUDIENCE_OPTIONS: AnnouncementAudience[] = [
  'All trainees',
  'Specific batch',
  'Trainees with incomplete documents',
  'Custom group',
]

export interface AnnouncementFormValues {
  title: string
  body: string
  audience: AnnouncementAudience
  batchNo: string
  groupTraineeNames: string[]
}

interface AddAnnouncementModalProps {
  open: boolean
  onClose: () => void
  onSave: (values: AnnouncementFormValues) => void
  batchOptions: string[]
  traineeOptions: string[]
  trainees: Trainee[]
  /** Given the current form state, resolve how many trainees will actually receive this announcement. */
  resolveRecipientCount: (values: Pick<AnnouncementFormValues, 'audience' | 'batchNo' | 'groupTraineeNames'>, trainees: Trainee[]) => number
}

function emptyValues(batchOptions: string[]): AnnouncementFormValues {
  return { title: '', body: '', audience: 'All trainees', batchNo: batchOptions[0] ?? '', groupTraineeNames: [] }
}

export function AddAnnouncementModal({ open, onClose, onSave, batchOptions, traineeOptions, trainees, resolveRecipientCount }: AddAnnouncementModalProps) {
  const [values, setValues] = useState<AnnouncementFormValues>(() => emptyValues(batchOptions))
  const [errors, setErrors] = useState<Partial<Record<'title' | 'body' | 'batchNo' | 'groupTraineeNames', string>>>({})

  useEffect(() => {
    if (open) {
      setValues(emptyValues(batchOptions))
      setErrors({})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function set<K extends keyof AnnouncementFormValues>(key: K, val: AnnouncementFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const recipientCount = useMemo(() => resolveRecipientCount(values, trainees), [values, trainees, resolveRecipientCount])

  function validate() {
    const next: typeof errors = {}
    if (!values.title.trim()) next.title = 'Subject is required.'
    if (!values.body.trim()) next.body = 'Description is required.'
    if (values.audience === 'Specific batch' && !values.batchNo) next.batchNo = 'Select a batch.'
    if (values.audience === 'Custom group' && values.groupTraineeNames.length === 0) next.groupTraineeNames = 'Select at least one trainee.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    onSave(values)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New announcement"
      description="Notifications are sent automatically to the selected audience via email once posted."
      maxWidth={480}
    >
      <TextField
        label="Subject"
        placeholder="e.g. Reminder: Submit your MOA before Friday"
        value={values.title}
        onChange={(e) => set('title', e.target.value)}
      />
      {errors.title && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.title}</p>}

      <TextAreaField
        label="Description"
        placeholder="Write the announcement details..."
        rows={4}
        value={values.body}
        onChange={(e) => set('body', e.target.value)}
      />
      {errors.body && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.body}</p>}

      <SelectField
        label="Audience"
        options={AUDIENCE_OPTIONS}
        value={values.audience}
        onChange={(e) => set('audience', e.target.value as AnnouncementAudience)}
      />

      {values.audience === 'Specific batch' && (
        <>
          <SelectField
            label="Batch"
            options={batchOptions}
            value={values.batchNo}
            onChange={(e) => set('batchNo', e.target.value)}
          />
          {errors.batchNo && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600">{errors.batchNo}</p>}
        </>
      )}

      {values.audience === 'Custom group' && (
        <div className="mb-3.5">
          <label className="mb-1.5 block text-xs font-medium text-neutral-600">Recipients</label>
          <MultiSelectDropdown
            options={traineeOptions}
            value={values.groupTraineeNames}
            placeholder="Select trainees"
            onChange={(v) => set('groupTraineeNames', v)}
          />
          {errors.groupTraineeNames && <p className="mt-1.5 text-xs font-medium text-danger-600">{errors.groupTraineeNames}</p>}
        </div>
      )}

      <InfoNote>
        <Info size={14} className="mt-0.5 shrink-0 text-neutral-400" />
        {recipientCount > 0
          ? `This will notify ${recipientCount} trainee${recipientCount === 1 ? '' : 's'} by email once posted.`
          : 'No trainees match this audience yet \u2014 refine your selection before posting.'}
      </InfoNote>

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit} disabled={recipientCount === 0}>
          Post announcement
        </Button>
      </div>
    </Modal>
  )
}
