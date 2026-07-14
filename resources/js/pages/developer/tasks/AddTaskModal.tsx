import { useEffect, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField, SelectField } from '@/components/FormField';
import { TODAY } from '@/data/mockData';
import { toDateInputValue } from '@/lib/utils';
export interface TaskFormValues {
  date: string;
  batchNo: string;
  trainee: string;
  trainer: string;
  task: string;
  description: string;
  timeGoal: string;
}
interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: TaskFormValues) => void;
  batchOptions: string[];
  traineeOptions: string[];
  trainerOptions: string[];
}
function emptyValues(batchOptions: string[], traineeOptions: string[], trainerOptions: string[]): TaskFormValues {
  return {
    date: toDateInputValue(TODAY),
    batchNo: batchOptions[0] ?? '',
    trainee: traineeOptions[0] ?? '',
    trainer: trainerOptions[0] ?? '',
    task: '',
    description: '',
    timeGoal: ''
  };
}
export function AddTaskModal({
  open,
  onClose,
  onSave,
  batchOptions,
  traineeOptions,
  trainerOptions
}: AddTaskModalProps) {
  const [values, setValues] = useState<TaskFormValues>(() => emptyValues(batchOptions, traineeOptions, trainerOptions));
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormValues, string>>>({});

  // Reset to a clean, defaulted form every time the modal is opened —
  // otherwise the previous task's data (or a stale Cancel) would linger.
  useEffect(() => {
    if (open) {
      setValues(emptyValues(batchOptions, traineeOptions, trainerOptions));
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  function set<K extends keyof TaskFormValues>(key: K, val: TaskFormValues[K]) {
    setValues(v => ({
      ...v,
      [key]: val
    }));
    setErrors(e => ({
      ...e,
      [key]: undefined
    }));
  }
  function validate() {
    const next: typeof errors = {};
    if (!values.date) next.date = 'Date is required.';
    if (!values.batchNo) next.batchNo = 'Batch is required.';
    if (!values.trainee) next.trainee = 'Trainee is required.';
    if (!values.trainer) next.trainer = 'Trainer is required.';
    if (!values.task.trim()) next.task = 'Task title is required.';
    if (!values.timeGoal.trim()) next.timeGoal = 'Time goal is required.';else if (Number.isNaN(Number(values.timeGoal)) || Number(values.timeGoal) <= 0) {
      next.timeGoal = 'Enter a positive number of hours.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  function handleSubmit() {
    if (!validate()) return;
    onSave(values);
  }
  return <Modal open={open} onClose={onClose} title="Add task" description="Assign a daily task to a trainee. It will appear as Open in the task list." maxWidth={440} data-cy="add-task-modal-modal-add-task">
      <TextField label="Date" type="date" value={values.date} onChange={e => set('date', e.target.value)} data-cy="add-task-modal-text-field-date" />
      {errors.date && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-3">{errors.date}</p>}

      <SelectField label="Batch" options={batchOptions} value={values.batchNo} onChange={e => set('batchNo', e.target.value)} data-cy="add-task-modal-select-field-batch" />
      {errors.batchNo && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-5">{errors.batchNo}</p>}

      <SelectField label="Trainee" options={traineeOptions} value={values.trainee} onChange={e => set('trainee', e.target.value)} data-cy="add-task-modal-select-field-trainee" />
      {errors.trainee && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-7">{errors.trainee}</p>}

      <SelectField label="Trainer" options={trainerOptions} value={values.trainer} onChange={e => set('trainer', e.target.value)} data-cy="add-task-modal-select-field-trainer" />
      {errors.trainer && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-9">{errors.trainer}</p>}

      <TextField label="Task" placeholder="Task title" value={values.task} onChange={e => set('task', e.target.value)} data-cy="add-task-modal-text-field-task" />
      {errors.task && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-11">{errors.task}</p>}

      <TextAreaField label="Description" optional placeholder="What should the trainee do for this task?" value={values.description} onChange={e => set('description', e.target.value)} data-cy="add-task-modal-text-area-field-description" />

      <TextField label="Time goal (hours)" type="number" min={0} step="0.5" placeholder="8" value={values.timeGoal} onChange={e => set('timeGoal', e.target.value)} data-cy="add-task-modal-text-field-8" />
      {errors.timeGoal && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-14">{errors.timeGoal}</p>}

      <div className="mt-2 flex gap-2" data-cy="add-task-modal-div-15">
        <Button variant="secondary" className="flex-1" onClick={onClose} data-cy="add-task-modal-button-close">
          Cancel
        </Button>
        <Button variant="primary" className="flex-1" onClick={handleSubmit} data-cy="add-task-modal-button-submit">
          Add
        </Button>
      </div>
    </Modal>;
}