import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField, SelectField } from '@/components/FormField';
import type { BiometricRecord } from '@/types';
export interface RecordFormValues {
  date: string;
  timeIn: string;
  timeOut: string;
  onLeave: boolean;
  remarks: string;
}
interface EditRecordModalProps {
  record: BiometricRecord & {
    traineeName: string;
  } | null;
  onClose: () => void;
  onSave: (id: string, values: RecordFormValues) => void;
}
export function EditRecordModal({
  record,
  onClose,
  onSave
}: EditRecordModalProps) {
  const [values, setValues] = useState<RecordFormValues>({
    date: '',
    timeIn: '',
    timeOut: '',
    onLeave: false,
    remarks: ''
  });
  useEffect(() => {
    if (record) {
      setValues({
        date: record.date,
        timeIn: record.timeIn ?? '',
        timeOut: record.timeOut ?? '',
        onLeave: record.onLeave,
        remarks: record.remarks ?? ''
      });
    }
  }, [record]);
  function set<K extends keyof RecordFormValues>(key: K, val: RecordFormValues[K]) {
    setValues(v => ({
      ...v,
      [key]: val
    }));
  }
  function handleSave() {
    if (!record) return;
    onSave(record.id, values);
  }
  return <Modal open={!!record} onClose={onClose} title="Edit attendance record" description={record ? `Editing ${record.traineeName}'s record` : undefined} maxWidth={420} data-cy="edit-record-modal-modal-edit-attendance-record">
      {record && <>
          <TextField label="Date" type="date" value={values.date} onChange={e => set('date', e.target.value)} data-cy="edit-record-modal-text-field-date" />

          <SelectField label="On leave" options={['No', 'Yes']} value={values.onLeave ? 'Yes' : 'No'} onChange={e => set('onLeave', e.target.value === 'Yes')} data-cy="edit-record-modal-select-field-on-leave" />

          {!values.onLeave && <div className="mb-3.5 grid grid-cols-2 gap-3" data-cy="edit-record-modal-div-4">
              <TextField label="Time in" type="time" value={values.timeIn} onChange={e => set('timeIn', e.target.value)} data-cy="edit-record-modal-text-field-time-in" />
              <TextField label="Time out" type="time" value={values.timeOut} onChange={e => set('timeOut', e.target.value)} data-cy="edit-record-modal-text-field-time-out" />
            </div>}

          <TextAreaField label="Remarks" optional placeholder={values.onLeave ? 'e.g. Sick Leave' : 'Optional note for this record...'} value={values.remarks} onChange={e => set('remarks', e.target.value)} data-cy="edit-record-modal-text-area-field-remarks" />

          <div className="mt-2 flex gap-2" data-cy="edit-record-modal-div-8">
            <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="edit-record-modal-button-close">Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleSave} data-cy="edit-record-modal-button-save">Save changes</Button>
          </div>
        </>}
    </Modal>;
}