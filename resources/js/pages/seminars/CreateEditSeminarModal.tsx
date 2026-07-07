import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField, TextAreaField, SelectField } from '@/components/FormField'
import { useToast } from '@/components/Toast'
import type { Seminar } from '@/types'

const SEMINAR_TYPES = ['Technical & Automation Workshops', 'Compliance & Softskills Seminars']

export interface SeminarDraft {
  topic: string
  description: string
  date: string
  venue: string
  fee: string
  maxParticipants: string
  type: string
}

const EMPTY_DRAFT: SeminarDraft = { topic: '', description: '', date: '', venue: '', fee: '', maxParticipants: '', type: SEMINAR_TYPES[0] }

interface Props {
  open: boolean
  onClose: () => void
  onSave: (draft: SeminarDraft, editingId?: string) => void
  editing?: Seminar | null
}

export function CreateEditSeminarModal({ open, onClose, onSave, editing }: Props) {
  const { showToast } = useToast()
  const [draft, setDraft] = useState<SeminarDraft>(EMPTY_DRAFT)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (!open) return
    setTouched(false)
    if (editing) {
      setDraft({
        topic: editing.topic,
        description: editing.description,
        date: editing.date,
        venue: editing.venue,
        fee: String(editing.fee ?? ''),
        maxParticipants: editing.maxParticipants ? String(editing.maxParticipants) : '',
        type: editing.type,
      })
    } else {
      setDraft(EMPTY_DRAFT)
    }
  }, [open, editing])

  const isValid = draft.topic.trim() && draft.description.trim() && draft.date && draft.venue.trim() && draft.fee !== ''

  function handleSave() {
    setTouched(true)
    if (!isValid) {
      showToast('Please fill in all required fields.', 'error')
      return
    }
    onSave(draft, editing?.id)
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Edit seminar' : 'Add seminar'} maxWidth={460}>
      <TextField
        label="Seminar topic"
        placeholder="e.g. AI Automation for HR"
        value={draft.topic}
        onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))}
        className={touched && !draft.topic.trim() ? '!border-danger-300' : ''}
      />
      <TextAreaField
        label="Description"
        placeholder="Seminar description"
        value={draft.description}
        onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
      />
      <SelectField
        label="Seminar track"
        options={SEMINAR_TYPES}
        value={draft.type}
        onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Date"
          type="date"
          value={draft.date}
          onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
        />
        <TextField
          label="Registration fee (PHP)"
          type="number"
          placeholder="0"
          value={draft.fee}
          onChange={(e) => setDraft((d) => ({ ...d, fee: e.target.value }))}
        />
      </div>
      <TextField
        label="Venue / Platform"
        placeholder="Online or physical location"
        value={draft.venue}
        onChange={(e) => setDraft((d) => ({ ...d, venue: e.target.value }))}
      />
      <TextField
        label="Maximum participants"
        type="number"
        placeholder="Leave blank for unlimited"
        optional
        value={draft.maxParticipants}
        onChange={(e) => setDraft((d) => ({ ...d, maxParticipants: e.target.value }))}
      />
      <div className="mt-2 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          {editing ? 'Save changes' : 'Create seminar'}
        </Button>
      </div>
    </Modal>
  )
}
