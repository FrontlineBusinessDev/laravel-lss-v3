import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField, SelectField } from '@/components/FormField';
import type { BiometricLogRow } from '@/types/modules/biometrics/biometrics';
export interface RecordFormValues {
  date: string;
  morningTimeIn: string;
  lunchTimeOut: string;
  afternoonTimeIn: string;
  dayTimeOut: string;
  onLeave: boolean;
  remarks: string;
}
interface EditRecordModalProps {
  record: BiometricLogRow | null;
  onClose: () => void;
  onSave: (id: number, values: RecordFormValues) => void;
}
export function EditRecordModal({
  record,
  onClose,
  onSave
}: EditRecordModalProps) {
  const [values, setValues] = useState<RecordFormValues>({
    date: '',
    morningTimeIn: '',
    lunchTimeOut: '',
    afternoonTimeIn: '',
    dayTimeOut: '',
    onLeave: false,
    remarks: ''
  });
  useEffect(() => {
    if (record) {
      setValues({
        date: record.date,
        morningTimeIn: record.morning_time_in ?? '',
        lunchTimeOut: record.lunch_time_out ?? '',
        afternoonTimeIn: record.afternoon_time_in ?? '',
        dayTimeOut: record.day_time_out ?? '',
        onLeave: record.on_leave,
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
  return <Modal open={!!record} onClose={onClose} title="Edit attendance record" description={record ? `Editing ${record.trainee_name}'s record` : undefined} maxWidth={460} data-cy="edit-record-modal-modal-edit-attendance-record">
      {record && <>
          <TextField label="Date" type="date" value={values.date} onChange={e => set('date', e.target.value)} data-cy="edit-record-modal-text-field-date" />

          <SelectField label="On leave" options={['No', 'Yes']} value={values.onLeave ? 'Yes' : 'No'} onChange={e => set('onLeave', e.target.value === 'Yes')} data-cy="edit-record-modal-select-field-on-leave" />

          {!values.onLeave && <div className="mb-3.5 grid grid-cols-2 gap-3" data-cy="edit-record-modal-div-4">
              <TextField label="Morning time in" type="time" value={values.morningTimeIn} onChange={e => set('morningTimeIn', e.target.value)} data-cy="edit-record-modal-text-field-morning-in" />
              <TextField label="Lunch out" type="time" value={values.lunchTimeOut} onChange={e => set('lunchTimeOut', e.target.value)} data-cy="edit-record-modal-text-field-lunch-out" />
              <TextField label="After lunch time in" type="time" value={values.afternoonTimeIn} onChange={e => set('afternoonTimeIn', e.target.value)} data-cy="edit-record-modal-text-field-afternoon-in" />
              <TextField label="Day time out" type="time" value={values.dayTimeOut} onChange={e => set('dayTimeOut', e.target.value)} data-cy="edit-record-modal-text-field-day-out" />
            </div>}

          <TextAreaField label="Remarks" optional placeholder={values.onLeave ? 'e.g. Sick Leave' : 'Optional note for this record...'} value={values.remarks} onChange={e => set('remarks', e.target.value)} data-cy="edit-record-modal-text-area-field-remarks" />

          <div className="mt-2 flex gap-2" data-cy="edit-record-modal-div-8">
            <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="edit-record-modal-button-close">Cancel</Button>
            <Button variant="primary" className="flex-1" onClick={handleSave} data-cy="edit-record-modal-button-save">Save changes</Button>
          </div>
        </>}
    </Modal>;
}
