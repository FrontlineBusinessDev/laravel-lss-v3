import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/components/Modal';
import { Button } from '@/components/Button';
import { TextField, TextAreaField } from '@/components/FormField';
import { AsyncMultiSelectField } from '@/hooks/use-async-multi-select-field';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import { loadLookupOptions, type FieldOption } from '@/types/reusable/fields';
import { toDateInputValue } from '@/lib/utils';

interface PersonOption {
  id: number;
  first_name: string;
  last_name: string;
}

export interface TaskCreatePayload {
  mode: 'create';
  date: string;
  batch_id: number;
  trainee_ids: number[];
  trainer_id: number;
  task: string;
  description: string;
  time_goal: number;
}
export interface TaskUpdatePayload {
  mode: 'edit';
  id: number;
  date: string;
  batch_id: number;
  trainee_id: number;
  trainer_id: number;
  task: string;
  description: string;
  time_goal: number;
}
export type TaskSavePayload = TaskCreatePayload | TaskUpdatePayload;

/** Row shape needed to pre-fill the edit form. Matches ApiTask in tasks/index.tsx. */
export interface EditableTaskRow {
  id: number;
  date: string;
  task: string;
  description: string | null;
  time_goal: string | number;
  batch: { id: number; batch_code: string } | null;
  trainee: { id: number; first_name: string; last_name: string } | null;
  trainer: { id: number; first_name: string; last_name: string } | null;
}

interface FormValues {
  date: string;
  batchId: string;
  batchLabel: string;
  traineeIds: string[];
  trainerId: string;
  trainerLabel: string;
  task: string;
  description: string;
  timeGoal: string;
}
interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: TaskSavePayload) => void;
  /** When set, the modal edits this row instead of creating new ones. */
  editingTask?: EditableTaskRow | null;
}
function personLabel(p: PersonOption): string {
  return `${p.first_name} ${p.last_name}`.trim();
}
function emptyValues(): FormValues {
  return {
    date: toDateInputValue(new Date()),
    batchId: '',
    batchLabel: '',
    traineeIds: [],
    trainerId: '',
    trainerLabel: '',
    task: '',
    description: '',
    timeGoal: ''
  };
}
function valuesFromRow(row: EditableTaskRow): FormValues {
  return {
    date: row.date?.slice(0, 10) ?? toDateInputValue(new Date()),
    batchId: row.batch ? String(row.batch.id) : '',
    batchLabel: row.batch?.batch_code ?? '',
    traineeIds: row.trainee ? [String(row.trainee.id)] : [],
    trainerId: row.trainer ? String(row.trainer.id) : '',
    trainerLabel: row.trainer ? personLabel(row.trainer) : '',
    task: row.task,
    description: row.description ?? '',
    timeGoal: String(Number(row.time_goal))
  };
}

let trainerOptionsCache: FieldOption[] | null = null;
async function loadTrainerOptions(query: string): Promise<FieldOption[]> {
  if (!trainerOptionsCache) {
    const res = await apiFetchJson<PersonOption[]>('/tasks/trainers');
    trainerOptionsCache = (res.data ?? []).map(p => ({ value: String(p.id), label: personLabel(p) }));
  }
  const q = query.trim().toLowerCase();
  return q ? trainerOptionsCache.filter(o => o.label.toLowerCase().includes(q)) : trainerOptionsCache;
}

export function AddTaskModal({
  open,
  onClose,
  onSave,
  editingTask
}: AddTaskModalProps) {
  const isEdit = !!editingTask;
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  useEffect(() => {
    if (!open) return;
    setValues(editingTask ? valuesFromRow(editingTask) : emptyValues());
    setErrors({});
  }, [open, editingTask]);

  const loadTraineeOptions = useMemo(() => {
    return async (query: string): Promise<FieldOption[]> => {
      if (!values.batchId) return [];
      const res = await apiFetchJson<{ data: PersonOption[] }>(
        `/trainees/pagination-search?filters[batch_id]=${values.batchId}&filters[status]=active&per_page=50&search=${encodeURIComponent(query)}`
      );
      return (res.data?.data ?? []).map(p => ({ value: String(p.id), label: personLabel(p) }));
    };
  }, [values.batchId]);

  function set<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues(v => ({ ...v, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  }
  function validate() {
    const next: typeof errors = {};
    if (!values.date) next.date = 'Date is required.';
    if (!values.batchId) next.batchId = 'Batch is required.';
    if (values.traineeIds.length === 0) next.traineeIds = 'Select at least one trainee.';
    if (!values.trainerId) next.trainerId = 'Trainer is required.';
    if (!values.task.trim()) next.task = 'Task title is required.';
    if (!values.timeGoal.trim()) next.timeGoal = 'Time goal is required.';else if (Number.isNaN(Number(values.timeGoal)) || Number(values.timeGoal) <= 0) {
      next.timeGoal = 'Enter a positive number of hours.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }
  function handleSubmit() {
    if (!validate()) return;
    const shared = {
      date: values.date,
      batch_id: Number(values.batchId),
      trainer_id: Number(values.trainerId),
      task: values.task.trim(),
      description: values.description.trim(),
      time_goal: Number(values.timeGoal)
    };
    if (isEdit && editingTask) {
      onSave({ mode: 'edit', id: editingTask.id, trainee_id: Number(values.traineeIds[0]), ...shared });
    } else {
      onSave({ mode: 'create', trainee_ids: values.traineeIds.map(Number), ...shared });
    }
  }
  return <Modal open={open} onClose={onClose} title={isEdit ? 'Edit task' : 'Add task'} description={isEdit ? 'Task details can be edited regardless of status.' : 'Assign a daily task to one or more trainees. It will appear as Open in the task list.'} maxWidth={440} data-cy="add-task-modal-modal-add-task">
      <TextField label="Date" type="date" value={values.date} onChange={e => set('date', e.target.value)} data-cy="add-task-modal-text-field-date" />
      {errors.date && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-3">{errors.date}</p>}

      <div className="mb-3.5" data-cy="add-task-modal-div-batch">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Batch</label>
        <AsyncSelectField
          value={values.batchId}
          initialLabel={values.batchLabel}
          placeholder="Select batch"
          loadOptions={(q) => loadLookupOptions('/batches', q, 'batch_code')}
          onChange={(v) => {
            set('batchId', (v as string) ?? '');
            set('traineeIds', []);
          }}
          error={errors.batchId}
        />
      </div>
      {errors.batchId && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-5">{errors.batchId}</p>}

      <div className="mb-3.5" data-cy="add-task-modal-div-trainee">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Trainee</label>
        {isEdit ? (
          <AsyncSelectField
            value={values.traineeIds[0] ?? ''}
            initialLabel={editingTask ? personLabel(editingTask.trainee ?? { id: 0, first_name: '', last_name: '' }) : ''}
            placeholder={values.batchId ? 'Select trainee' : 'Select a batch first'}
            disabled={!values.batchId}
            loadOptions={loadTraineeOptions}
            onChange={(v) => set('traineeIds', v ? [v as string] : [])}
            error={errors.traineeIds}
          />
        ) : (
          <AsyncMultiSelectField
            value={values.traineeIds}
            placeholder={values.batchId ? 'Select trainee(s)' : 'Select a batch first'}
            disabled={!values.batchId}
            loadOptions={loadTraineeOptions}
            onChange={(v) => set('traineeIds', v)}
            error={errors.traineeIds}
          />
        )}
      </div>
      {errors.traineeIds && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-7">{errors.traineeIds}</p>}

      <div className="mb-3.5" data-cy="add-task-modal-div-trainer">
        <label className="mb-1.5 block text-xs font-medium text-neutral-600">Trainer</label>
        <AsyncSelectField
          value={values.trainerId}
          initialLabel={values.trainerLabel}
          placeholder="Select trainer"
          loadOptions={loadTrainerOptions}
          onChange={(v) => set('trainerId', (v as string) ?? '')}
          error={errors.trainerId}
        />
      </div>
      {errors.trainerId && <p className="-mt-2.5 mb-3.5 text-xs font-medium text-danger-600" data-cy="add-task-modal-p-9">{errors.trainerId}</p>}

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
          {isEdit ? 'Save changes' : 'Add'}
        </Button>
      </div>
    </Modal>;
}
