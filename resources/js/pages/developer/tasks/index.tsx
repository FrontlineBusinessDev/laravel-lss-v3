import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Lock, CheckCircle2, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Dropdown } from '@/components/Dropdown';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { useToast } from '@/components/Toast';
import { apiFetchJson } from '@/lib/apiFetch';
import { cn } from '@/lib/utils';
import TasksPrimaryLayout from '@/layouts/tasks/TasksPrimaryLayout';
import { AddTaskModal, type TaskCreatePayload } from '@/pages/developer/tasks/AddTaskModal';

interface ApiTask {
  id: number;
  status: 'open' | 'completed' | 'locked';
  task: string;
  description: string | null;
  time_goal: string | number;
  time_spent: string | number;
  date: string;
  remarks: string | null;
  batch: {
    id: number;
    batch_code: string;
  } | null;
  trainee: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
  trainer: {
    id: number;
    first_name: string;
    last_name: string;
  } | null;
}
const STATUS_STYLE: Record<string, string> = {
  open: 'bg-warning-50 text-warning-800',
  completed: 'bg-success-50 text-success-800',
  locked: 'bg-neutral-100 text-neutral-600'
};
const STATUS_LABEL: Record<string, string> = {
  open: 'Open',
  completed: 'Completed',
  locked: 'Locked'
};
function personName(p: {
  first_name: string;
  last_name: string;
} | null): string {
  return p ? `${p.first_name} ${p.last_name}`.trim() : '—';
}

/** Pending destructive/state-changing action awaiting confirmation. */
type PendingAction = {
  kind: 'complete' | 'lock' | 'delete';
  task: ApiTask;
} | null;
const ACTION_COPY: Record<NonNullable<PendingAction>['kind'], {
  title: string;
  body: (t: string) => string;
  confirmLabel: string;
  tone: 'danger' | 'default';
}> = {
  complete: {
    title: 'Mark task as complete',
    body: t => `Mark "${t}" as complete? The trainee's time spent will be locked in for reporting.`,
    confirmLabel: 'Mark complete',
    tone: 'default'
  },
  lock: {
    title: 'Lock task',
    body: t => `Lock "${t}"? Locked tasks can no longer be edited or completed.`,
    confirmLabel: 'Lock task',
    tone: 'default'
  },
  delete: {
    title: 'Delete task',
    body: t => `Delete "${t}"? This cannot be undone.`,
    confirmLabel: 'Delete',
    tone: 'danger'
  }
};
export default function TasksPage() {
  const {
    showToast
  } = useToast();
  const [records, setRecords] = useState<ApiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState<ApiTask | null>(null);
  const [viewRemarks, setViewRemarks] = useState('');
  const [managementBatchFilter, setManagementBatchFilter] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetchJson<{
        data: ApiTask[];
      }>('/tasks/pagination-search?per_page=100&sort_by=date&sort_dir=desc');
      setRecords(res.data?.data ?? []);
    } catch {
      showToast('Failed to load tasks.', 'error');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const batchNumbers = useMemo(() => Array.from(new Set(records.map(t => t.batch?.batch_code).filter((v): v is string => !!v))).sort(), [records]);
  const managementRows = useMemo(() => records.filter(t => !managementBatchFilter || managementBatchFilter === 'Batch' ? true : t.batch?.batch_code === managementBatchFilter), [records, managementBatchFilter]);

  async function handleAddTask(payload: TaskCreatePayload) {
    try {
      await apiFetchJson('/tasks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setAddModalOpen(false);
      showToast(`Task "${payload.task}" assigned.`, 'success');
      loadTasks();
    } catch {
      showToast('Failed to create task.', 'error');
    }
  }
  function requestAction(kind: NonNullable<PendingAction>['kind'], task: ApiTask) {
    setPendingAction({
      kind,
      task
    });
  }
  async function confirmPendingAction() {
    if (!pendingAction) return;
    const {
      kind,
      task
    } = pendingAction;
    try {
      if (kind === 'delete') {
        await apiFetchJson(`/tasks/${task.id}`, {
          method: 'DELETE'
        });
        showToast(`"${task.task}" was deleted.`, 'error');
      } else if (kind === 'complete') {
        await apiFetchJson(`/tasks/${task.id}/complete`, {
          method: 'PATCH'
        });
        showToast(`"${task.task}" marked as complete.`, 'success');
      } else {
        await apiFetchJson(`/tasks/${task.id}/lock`, {
          method: 'PATCH'
        });
        showToast(`"${task.task}" locked.`, 'success');
      }
      loadTasks();
    } catch {
      showToast('Action failed.', 'error');
    } finally {
      setPendingAction(null);
    }
  }
  async function saveRemarks() {
    if (!viewTask) return;
    try {
      await apiFetchJson(`/tasks/${viewTask.id}/remarks`, {
        method: 'PATCH',
        body: JSON.stringify({
          remarks: viewRemarks
        })
      });
      showToast(`Remarks saved for ${personName(viewTask.trainee)}'s "${viewTask.task}".`, 'success');
      setViewTask(null);
      loadTasks();
    } catch {
      showToast('Failed to save remarks.', 'error');
    }
  }
  return <TasksPrimaryLayout data-cy="index-tasks-primary-layout-1">
      <div data-cy="index-div-1">
        <div className="mb-4 flex items-center justify-between" data-cy="index-div-2">
          <span className="text-xs text-neutral-400" data-cy="index-span-task">{loading ? 'Loading…' : `${managementRows.length} task${managementRows.length === 1 ? '' : 's'}`}</span>
          <Button variant="primary" icon={Plus} onClick={() => setAddModalOpen(true)} data-cy="index-button-set-add-modal-open">
            Add task
          </Button>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3" data-cy="index-div-9">
          <Dropdown options={['Batch', ...batchNumbers]} placeholder="Batch" onChange={setManagementBatchFilter} className="sm:w-44" data-cy="index-dropdown-batch" />
        </div>

        <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block" data-cy="index-div-12">
          <div className="overflow-x-auto lss-scrollbar" data-cy="index-div-13">
            <table className="w-full min-w-[880px] border-collapse text-sm" data-cy="index-table-14">
              <thead data-cy="index-thead-15">
                <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="index-tr-16">
                  <th className="px-4 py-2.5 font-medium" data-cy="index-th-status">Status</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="index-th-batch">Batch</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="index-th-task">Task</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="index-th-description">Description</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="index-th-time-goal">Time goal</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="index-th-trainee">Trainee</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="index-th-trainer">Trainer</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="index-th-date">Date</th>
                  <th className="px-4 py-2.5 font-medium text-right" data-cy="index-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody data-cy="index-tbody-26">
                {managementRows.map(t => <tr key={t.id} className="border-t border-neutral-100 transition-colors hover:bg-neutral-50" data-cy="index-tr-27">
                    <td className="px-4 py-2.5" data-cy="index-td-28">
                      <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[t.status])} data-cy="index-span-29">
                        {STATUS_LABEL[t.status]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-30">{t.batch?.batch_code ?? '—'}</td>
                    <td className="px-4 py-2.5 font-medium text-ink" data-cy="index-td-31">{t.task}</td>
                    <td className="px-4 py-2.5 max-w-[220px] truncate text-xs text-neutral-500" title={t.description ?? ''} data-cy="index-td-t-description">{t.description}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-h">{Number(t.time_goal)}h</td>
                    <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-34">{personName(t.trainee)}</td>
                    <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-35">{personName(t.trainer)}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-36">{t.date?.slice(0, 10)}</td>
                    <td className="px-4 py-2.5" data-cy="index-td-37">
                      <div className="flex justify-end gap-0.5" data-cy="index-div-38">
                        <TooltipIconButton icon={FolderOpen} label="Open" onClick={() => {
                        setViewTask(t);
                        setViewRemarks(t.remarks ?? '');
                      }} data-cy="index-tooltip-icon-button-open" />
                        <TooltipIconButton icon={CheckCircle2} label="Complete" disabled={t.status === 'completed' || t.status === 'locked'} onClick={() => requestAction('complete', t)} data-cy="index-tooltip-icon-button-complete" />
                        <TooltipIconButton icon={Lock} label="Lock" disabled={t.status === 'locked'} onClick={() => requestAction('lock', t)} data-cy="index-tooltip-icon-button-lock" />
                        <TooltipIconButton icon={Trash2} label="Delete" danger onClick={() => requestAction('delete', t)} data-cy="index-tooltip-icon-button-delete" />
                      </div>
                    </td>
                  </tr>)}
                {!loading && managementRows.length === 0 && <tr data-cy="index-tr-43">
                    <td colSpan={9} className="px-4 py-10 text-center text-xs text-neutral-400" data-cy="index-td-no-tasks-match-this-filter">
                      No tasks match this filter.
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-2 sm:hidden" data-cy="index-div-45">
          {managementRows.map(t => <div key={t.id} className="rounded-lg border border-neutral-200 bg-white p-3.5" data-cy="index-div-46">
              <button onClick={() => {
            setViewTask(t);
            setViewRemarks(t.remarks ?? '');
          }} className="flex w-full items-start justify-between gap-2 text-left" data-cy="index-button-set-view-task">
                <div className="min-w-0" data-cy="index-div-48">
                  <p className="truncate text-sm font-semibold text-ink" data-cy="index-p-49">{t.task}</p>
                  <p className="truncate text-xs text-neutral-500" data-cy="index-p-50">
                    {t.batch?.batch_code} · {personName(t.trainee)}
                  </p>
                </div>
                <span className={cn('shrink-0 rounded-pill px-2 py-0.5 text-[11px] font-medium', STATUS_STYLE[t.status])} data-cy="index-span-51">
                  {STATUS_LABEL[t.status]}
                </span>
              </button>
              <p className="mt-1.5 text-xs text-neutral-500" data-cy="index-p-52">
                {personName(t.trainer)} · {Number(t.time_goal)}h goal · {t.date?.slice(0, 10)}
              </p>
              <div className="mt-2.5 flex gap-2 border-t border-neutral-100 pt-2.5" data-cy="index-div-53">
                <TooltipIconButton icon={CheckCircle2} label="Complete" disabled={t.status === 'completed' || t.status === 'locked'} onClick={() => requestAction('complete', t)} data-cy="index-tooltip-icon-button-complete-2" />
                <TooltipIconButton icon={Lock} label="Lock" disabled={t.status === 'locked'} onClick={() => requestAction('lock', t)} data-cy="index-tooltip-icon-button-lock-2" />
                <TooltipIconButton icon={Trash2} label="Delete" danger onClick={() => requestAction('delete', t)} data-cy="index-tooltip-icon-button-delete-2" />
              </div>
            </div>)}
          {!loading && managementRows.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400" data-cy="index-div-no-tasks-match-this-filter">
              No tasks match this filter.
            </div>}
        </div>

        {/* Add task modal */}
        <AddTaskModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddTask} data-cy="index-add-task-modal-set-add-modal-open" />

        {/* View task modal ("Open" action) */}
        <Modal open={!!viewTask} onClose={() => setViewTask(null)} title={viewTask?.task ?? ''} maxWidth={440} data-cy="index-modal-set-view-task">
          {viewTask && <div className="flex flex-col gap-3 text-sm" data-cy="index-div-119">
              <div className="flex items-center gap-2" data-cy="index-div-120">
                <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[viewTask.status])} data-cy="index-span-121">
                  {STATUS_LABEL[viewTask.status]}
                </span>
                <span className="font-mono text-xs text-neutral-500" data-cy="index-span-122">{viewTask.batch?.batch_code}</span>
              </div>
              <p className="text-neutral-600" data-cy="index-p-123">{viewTask.description}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-neutral-50 p-3 text-xs" data-cy="index-div-124">
                <div data-cy="index-div-125"><span className="text-neutral-500" data-cy="index-span-trainee">Trainee</span><div className="font-medium text-ink" data-cy="index-div-127">{personName(viewTask.trainee)}</div></div>
                <div data-cy="index-div-128"><span className="text-neutral-500" data-cy="index-span-trainer">Trainer</span><div className="font-medium text-ink" data-cy="index-div-130">{personName(viewTask.trainer)}</div></div>
                <div data-cy="index-div-131"><span className="text-neutral-500" data-cy="index-span-date">Date</span><div className="font-mono font-medium text-ink" data-cy="index-div-133">{viewTask.date?.slice(0, 10)}</div></div>
                <div data-cy="index-div-134"><span className="text-neutral-500" data-cy="index-span-time-goal">Time goal</span><div className="font-mono font-medium text-ink" data-cy="index-div-h">{Number(viewTask.time_goal)}h</div></div>
                <div data-cy="index-div-137"><span className="text-neutral-500" data-cy="index-span-time-spent">Time spent</span><div className="font-mono font-medium text-ink" data-cy="index-div-139">{Number(viewTask.time_spent)}h</div></div>
              </div>
              <div data-cy="index-div-140">
                <label className="mb-1.5 block text-xs font-medium text-neutral-600" data-cy="index-label-remarks">Remarks</label>
                <textarea key={viewTask.id} value={viewRemarks} onChange={e => setViewRemarks(e.target.value)} placeholder="Add remarks..." rows={3} className="w-full resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="index-textarea-add-remarks" />
              </div>
              <div className="mt-1 flex justify-end gap-2" data-cy="index-div-144">
                <Button variant="secondary" onClick={() => setViewTask(null)} data-cy="index-button-set-view-task-2">Close</Button>
                <Button variant="primary" onClick={saveRemarks} data-cy="index-button-commit-remarks">
                  Save remarks
                </Button>
              </div>
            </div>}
        </Modal>

        {/* Confirm status change / delete */}
        <ConfirmDialog open={!!pendingAction} onClose={() => setPendingAction(null)} onConfirm={confirmPendingAction} title={pendingAction ? ACTION_COPY[pendingAction.kind].title : ''} description={pendingAction ? ACTION_COPY[pendingAction.kind].body(pendingAction.task.task) : ''} confirmLabel={pendingAction ? ACTION_COPY[pendingAction.kind].confirmLabel : 'Confirm'} tone={pendingAction ? ACTION_COPY[pendingAction.kind].tone : 'default'} data-cy="index-confirm-dialog-set-pending-action" />
      </div>
    </TasksPrimaryLayout>;
}
