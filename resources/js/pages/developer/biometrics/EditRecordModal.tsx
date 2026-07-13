import { useEffect, useState } from 'react'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { TextField, TextAreaField, SelectField } from '@/components/FormField'
import type { BiometricRecord } from '@/types'

export interface RecordFormValues {
  date: string
  timeIn: string
  timeOut: string
  onLeave: boolean
  remarks: string
}

interface EditRecordModalProps {
  record: (BiometricRecord & { traineeName: string }) | null
  onClose: () => void
  onSave: (id: string, values: RecordFormValues) => void
}

export function EditRecordModal({ record, onClose, onSave }: EditRecordModalProps) {
  const [values, setValues] = useState<RecordFormValues>({ date: '', timeIn: '', timeOut: '', onLeave: false, remarks: '' })

  useEffect(() => {
    if (record) {
      setValues({
        date: record.date,
        timeIn: record.timeIn ?? '',
        timeOut: record.timeOut ?? '',
        onLeave: record.onLeave,
        remarks: record.remarks ?? '',
      })
    }
  }, [record])

  function set<K extends keyof RecordFormValues>(key: K, val: RecordFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }))
  }

  function handleSave() {
    if (!record) return
    onSave(record.id, values)
  }

  return (
    <Modal open={!!record} onClose={onClose} title="Edit attendance record" description={record ? `Editing ${record.traineeName}'s record` : undefined} maxWidth={420}>
      {record && (
        <>
          <TextField label="Date" type="date" value={values.date} onChange={(e) => set('date', e.target.value)} />

          <SelectField
            label="On leave"
            options={['No', 'Yes']}
            value={values.onLeave ? 'Yes' : 'No'}
            onChange={(e) => set('onLeave', e.target.value === 'Yes')}
          />

          {!values.onLeave && (
            <div className="mb-3.5 grid grid-cols-2 gap-3">
              <TextField label="Time in" type="time" value={values.timeIn} onChange={(e) => set('timeIn', e.target.value)} />
              <TextField label="Time out" type="time" value={values.timeOut} onChange={(e) => set('timeOut', e.target.value)} />
            </div>
          )}

          <TextAreaField
            label="Remarks"
            optional
            placeholder={values.onLeave ? 'e.g. Sick Leave' : 'Optional note for this record...'}
            value={values.remarks}
            onChange={(e) => set('remarks', e.target.value)}
          />

          <div className="mt-2 flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleSave}>Save changes</Button>
          </div>
        </>
      )}
    </Modal>
  )
}
