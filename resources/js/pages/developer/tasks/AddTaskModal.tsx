import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/Button';
import {
    errorInputCls,
    Field,
    inputCls,
    textareaCls,
} from '@/components/form/Field';
import { Modal } from '@/components/Modal';
import { AsyncMultiSelectField } from '@/hooks/use-async-multi-select-field';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn, toDateInputValue } from '@/lib/utils';
import { loadLookupOptions } from '@/types/reusable/fields';
import type { FieldOption } from '@/types/reusable/fields';
import type { TaskPriority } from '@/types/task';

const PRIORITY_OPTIONS = ['', 'High', 'Medium', 'Low'] as const;

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
  priority: TaskPriority | '';
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
  priority: TaskPriority | '';
}
export type TaskSavePayload = TaskCreatePayload | TaskUpdatePayload;

/** Row shape needed to pre-fill the edit form. Matches ApiTask in tasks/index.tsx. */
export interface EditableTaskRow {
  id: number;
  date: string;
  task: string;
  description: string | null;
  time_goal: string | number;
  priority: TaskPriority | null;
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
  priority: string;
}
interface AddTaskModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: TaskSavePayload) => Promise<void>;
  /** When set, the modal edits this row instead of creating new ones. */
  editingTask?: EditableTaskRow | null;
  /** Batch picker source — trainer pages pass their own scoped
   * `/trainer/batches/lookup` so the dropdown never lists a batch the
   * backend would reject (Rule::in(assignedBatchIds()) on store()/update()). */
  batchLookupUrl?: string;
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
    timeGoal: '',
    priority: ''
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
    timeGoal: String(Number(row.time_goal)),
    priority: row.priority ? row.priority[0].toUpperCase() + row.priority.slice(1) : ''
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

// Mirrors TasksController::storeRules()/updateRules(): date, batch, at least
// one trainee, trainer, and task title are required; time_goal is required
// numeric >= 0.5 (fan-out create uses trainee_ids, edit uses a single
// trainee_id — both funnel through this one traineeIds array). priority is
// optional (nullable in high/medium/low), stored capitalized here for the
// select and lower-cased again on submit.
const taskFormSchema = z.object({
  date: z.string().min(1, 'Date is required.'),
  batchId: z.string().min(1, 'Batch is required.'),
  batchLabel: z.string(),
  traineeIds: z.array(z.string()).min(1, 'Select at least one trainee.'),
  trainerId: z.string().min(1, 'Trainer is required.'),
  trainerLabel: z.string(),
  task: z.string().trim().min(1, 'Task title is required.'),
  description: z.string(),
  timeGoal: z
    .string()
    .min(1, 'Time goal is required.')
    .refine(
      (v) => !Number.isNaN(Number(v)) && Number(v) >= 0.5,
      'Time goal must be at least 0.5 hours.',
    ),
  priority: z.string(),
}) satisfies z.ZodType<FormValues>;

export function AddTaskModal({
  open,
  onClose,
  onSave,
  editingTask,
  batchLookupUrl = '/batches'
}: AddTaskModalProps) {
  const isEdit = !!editingTask;
  const {
    control,
    register,
    watch,
    setValue,
    reset,
    handleSubmit: handleFormSubmit,
    formState: { errors, isSubmitting: submitting },
  } = useForm<FormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: emptyValues(),
  });
  const [formError, setFormError] = useState<string | null>(null);
  const batchId = watch('batchId');
  const date = watch('date');

  useEffect(() => {
    if (!open) {
      return;
    }

    reset(editingTask ? valuesFromRow(editingTask) : emptyValues());
    setFormError(null);
  }, [open, editingTask, reset]);

  const loadTraineeOptions = useMemo(() => {
    return async (query: string): Promise<FieldOption[]> => {
      if (!batchId) {
        return [];
      }

      // Excludes trainees with an approved leave covering the task's date,
      // so they can't be assigned a task while on leave.
      const excludeParam = date
        ? `&exclude_on_leave_date=${encodeURIComponent(date)}`
        : '';

      const res = await apiFetchJson<{ data: PersonOption[] }>(
        `/trainees/pagination-search?filters[batch_id]=${batchId}&filters[status]=active&per_page=50&search=${encodeURIComponent(query)}${excludeParam}`
      );

      return (res.data?.data ?? []).map(p => ({ value: String(p.id), label: personLabel(p) }));
    };
  }, [batchId, date]);

  async function onValid(values: FormValues) {
    setFormError(null);

    const shared = {
      date: values.date,
      batch_id: Number(values.batchId),
      trainer_id: Number(values.trainerId),
      task: values.task.trim(),
      description: values.description.trim(),
      time_goal: Number(values.timeGoal),
      priority: (values.priority.toLowerCase() as TaskPriority | '')
    };
    const payload: TaskSavePayload =
      isEdit && editingTask
        ? { mode: 'edit', id: editingTask.id, trainee_id: Number(values.traineeIds[0]), ...shared }
        : { mode: 'create', trainee_ids: values.traineeIds.map(Number), ...shared };

    try {
      await onSave(payload);
      onClose();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Failed to save task.');
    }
  }

  return <Modal open={open} onClose={onClose} title={isEdit ? 'Edit task' : 'Add task'} description={isEdit ? 'Task details can be edited regardless of status.' : 'Assign a daily task to one or more trainees. It will appear as Open in the task list.'} maxWidth={440} data-cy="add-task-modal-modal-add-task">
      <form onSubmit={handleFormSubmit(onValid)} className="space-y-0" data-cy="add-task-modal-form-submit">
        <Field label="Date" required error={errors.date?.message} data-cy="add-task-modal-field-date">
          <input type="date" className={cn(inputCls, errors.date && errorInputCls)} {...register('date')} data-cy="add-task-modal-text-field-date" />
        </Field>

        <Field label="Batch" required error={errors.batchId?.message} data-cy="add-task-modal-field-batch">
          <Controller
            control={control}
            name="batchId"
            render={({ field }) => (
              <AsyncSelectField
                value={field.value}
                initialLabel={watch('batchLabel')}
                placeholder="Select batch"
                loadOptions={(q) => loadLookupOptions(batchLookupUrl, q, 'batch_code')}
                onChange={(v) => {
                  field.onChange((v as string) ?? '');
                  setValue('traineeIds', []);
                }}
                error={errors.batchId?.message}
              />
            )}
          />
        </Field>

        <Field label="Trainee" required error={errors.traineeIds?.message} data-cy="add-task-modal-field-trainee">
          <Controller
            control={control}
            name="traineeIds"
            render={({ field }) =>
              isEdit ? (
                <AsyncSelectField
                  value={field.value[0] ?? ''}
                  initialLabel={editingTask ? personLabel(editingTask.trainee ?? { id: 0, first_name: '', last_name: '' }) : ''}
                  placeholder={batchId ? 'Select trainee' : 'Select a batch first'}
                  disabled={!batchId}
                  loadOptions={loadTraineeOptions}
                  onChange={(v) => field.onChange(v ? [v as string] : [])}
                  error={errors.traineeIds?.message}
                />
              ) : (
                <AsyncMultiSelectField
                  value={field.value}
                  placeholder={batchId ? 'Select trainee(s)' : 'Select a batch first'}
                  disabled={!batchId}
                  loadOptions={loadTraineeOptions}
                  onChange={field.onChange}
                  error={errors.traineeIds?.message}
                />
              )
            }
          />
        </Field>

        <Field label="Trainer" required error={errors.trainerId?.message} data-cy="add-task-modal-field-trainer">
          <Controller
            control={control}
            name="trainerId"
            render={({ field }) => (
              <AsyncSelectField
                value={field.value}
                initialLabel={watch('trainerLabel')}
                placeholder="Select trainer"
                loadOptions={loadTrainerOptions}
                onChange={(v) => field.onChange((v as string) ?? '')}
                error={errors.trainerId?.message}
              />
            )}
          />
        </Field>

        <Field label="Task" required error={errors.task?.message} data-cy="add-task-modal-field-task">
          <input placeholder="Task title" className={cn(inputCls, errors.task && errorInputCls)} {...register('task')} data-cy="add-task-modal-text-field-task" />
        </Field>

        <Field label="Description" error={errors.description?.message} data-cy="add-task-modal-field-description">
          <textarea placeholder="What should the trainee do for this task?" rows={3} className={cn(textareaCls, errors.description && errorInputCls)} {...register('description')} data-cy="add-task-modal-text-area-field-description" />
        </Field>

        <Field label="Time goal (hours)" required error={errors.timeGoal?.message} data-cy="add-task-modal-field-time-goal">
          <input type="number" min={0} step="0.5" placeholder="8" className={cn(inputCls, errors.timeGoal && errorInputCls)} {...register('timeGoal')} data-cy="add-task-modal-text-field-time-goal" />
        </Field>

        <Field label="Priority" error={errors.priority?.message} data-cy="add-task-modal-field-priority">
          <select className={inputCls} {...register('priority')} data-cy="add-task-modal-select-field-priority">
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o} value={o} data-cy="add-task-modal-option">
                {o || 'None'}
              </option>
            ))}
          </select>
        </Field>

        {formError && (
          <p className="text-danger-700 rounded-md bg-danger-50 px-3 py-2 text-xs" data-cy="add-task-modal-p-form-error">
            {formError}
          </p>
        )}

        <div className="mt-2 flex gap-2" data-cy="add-task-modal-div-15">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={submitting} data-cy="add-task-modal-button-close">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={submitting} data-cy="add-task-modal-button-submit">
            {submitting && <Loader2 className="mr-1.5 inline h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Add'}
          </Button>
        </div>
      </form>
    </Modal>;
}
