import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField, SelectField } from '@/components/FormField';
import { apiFetchJson } from '@/lib/apiFetch';
import { toDateInputValue } from '@/lib/utils';

interface BatchOption {
  id: number;
  batch_code: string;
}
interface PersonOption {
  id: number;
  first_name: string;
  last_name: string;
}

export interface TaskCreatePayload {
  date: string;
  batch_id: number;
  trainee_id: number;
  trainer_id: number;
  task: string;
  description: string;
  time_goal: number;
}
interface FormValues {
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
  onSave: (values: TaskCreatePayload) => void;
}
function personLabel(p: PersonOption): string {
  return `${p.first_name} ${p.last_name}`.trim();
}
function emptyValues(): FormValues {
  return {
    date: toDateInputValue(new Date()),
    batchNo: '',
    trainee: '',
    trainer: '',
    task: '',
    description: '',
    timeGoal: ''
  };
}
export function AddTaskModal({
  open,
  onClose,
  onSave
}: AddTaskModalProps) {
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [trainers, setTrainers] = useState<PersonOption[]>([]);
  const [trainees, setTrainees] = useState<PersonOption[]>([]);

  // Reset to a clean, defaulted form and reload batch/trainer options every
  // time the modal is opened — otherwise the previous task's data would linger.
  useEffect(() => {
    if (!open) return;
    setValues(emptyValues());
    setErrors({});
    setTrainees([]);
    apiFetchJson<BatchOption[]>('/batches/lookup?status=active&per_page=50').then(res => setBatches(res.data ?? []));
    apiFetchJson<PersonOption[]>('/tasks/trainers').then(res => setTrainers(res.data ?? []));
  }, [open]);

  // Trainee options are scoped to whichever batch is currently selected.
  useEffect(() => {
    const batch = batches.find(b => b.batch_code === values.batchNo);
    if (!batch) {
      setTrainees([]);
      return;
    }
    apiFetchJson<{
      data: PersonOption[];
    }>(`/trainees/pagination-search?filters[batch_id]=${batch.id}&filters[status]=active&per_page=100`).then(res => setTrainees(res.data?.data ?? []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.batchNo, batches]);

  const batchOptions = useMemo(() => batches.map(b => b.batch_code), [batches]);
  const trainerOptions = useMemo(() => trainers.map(personLabel), [trainers]);
  const traineeOptions = useMemo(() => trainees.map(personLabel), [trainees]);

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues(v => ({
      ...v,
      [key]: val,
      // Changing batch invalidates whichever trainee was picked for the old batch.
      ...(key === 'batchNo' ? { trainee: '' } : {})
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
    const batch = batches.find(b => b.batch_code === values.batchNo);
    const trainee = trainees.find(t => personLabel(t) === values.trainee);
    const trainer = trainers.find(t => personLabel(t) === values.trainer);
    if (!batch || !trainee || !trainer) return;
    onSave({
      date: values.date,
      batch_id: batch.id,
      trainee_id: trainee.id,
      trainer_id: trainer.id,
      task: values.task.trim(),
      description: values.description.trim(),
      time_goal: Number(values.timeGoal)
    });
  }
  return <Modal open={open} onClose={onClose} title="Add task" description="Assign a daily task to a trainee. It will appear as Open in the task list." maxWidth={440} data-cy="add-task-modal-modal-add-task">
      <TextField label="Date" type="date" value={values.date} onChange={e => set('date', e.target.value)} data-cy="add-task-modal-text-field-date" />
      {errors.date && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-3">{errors.date}</p>}

      <SelectField label="Batch" options={['Select batch', ...batchOptions]} value={values.batchNo || 'Select batch'} onChange={e => set('batchNo', e.target.value === 'Select batch' ? '' : e.target.value)} data-cy="add-task-modal-select-field-batch" />
      {errors.batchNo && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-5">{errors.batchNo}</p>}

      <SelectField label="Trainee" options={traineeOptions.length ? ['Select trainee', ...traineeOptions] : ['Select a batch first']} value={values.trainee || (traineeOptions.length ? 'Select trainee' : 'Select a batch first')} onChange={e => set('trainee', ['Select trainee', 'Select a batch first'].includes(e.target.value) ? '' : e.target.value)} disabled={!values.batchNo} data-cy="add-task-modal-select-field-trainee" />
      {errors.trainee && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-7">{errors.trainee}</p>}

      <SelectField label="Trainer" options={['Select trainer', ...trainerOptions]} value={values.trainer || 'Select trainer'} onChange={e => set('trainer', e.target.value === 'Select trainer' ? '' : e.target.value)} data-cy="add-task-modal-select-field-trainer" />
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
