import { useMemo, useState } from 'react';
import { Plus, Printer, Lock, CheckCircle2, FolderOpen, Trash2, X, Info } from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { Dropdown } from '@/components/Dropdown';
import { MultiSelectDropdown } from '@/components/MultiSelectDropdown';
import { TooltipIconButton } from '@/components/TooltipIconButton';
import { useToast } from '@/components/Toast';
import { taskRecords as initialTaskRecords, appUsers } from '@/data/mockData';
import { useBatches } from '@/context/BatchesContext';
import type { TaskRecord } from '@/types';
import { cn } from '@/lib/utils';
import { AddTaskModal, type TaskFormValues } from '@/pages/tasks/AddTaskModal';
import { DailyTaskSheetPrint } from '@/pages/tasks/DailyTaskSheetPrint';
const TABS = ['Task management', 'Daily task sheet'] as const;
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
const trainerNames = Array.from(new Set(appUsers.filter(u => u.role === 'Trainer').map(u => u.name).concat(['Sir Ralph', 'Sir Roy', 'Sir Mon', 'Ms. Thea']))).filter((v, i, arr) => arr.indexOf(v) === i).sort();

/** Draft vs. applied filter state for the Daily Task Sheet tab, per the Filter / Cancel workflow. */
interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  batch: string;
  trainees: string[];
  trainers: string[];
}
const EMPTY_FILTERS: ReportFilters = {
  dateFrom: '',
  dateTo: '',
  batch: '',
  trainees: [],
  trainers: []
};

/** Pending destructive/state-changing action awaiting confirmation. */
type PendingAction = {
  kind: 'complete' | 'lock' | 'delete';
  task: TaskRecord;
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
    trainees,
    batches
  } = useBatches();
  const {
    showToast
  } = useToast();
  const traineeNames = useMemo(() => Array.from(new Set(trainees.map(t => t.name))).sort(), [trainees]);
  const batchNumbers = useMemo(() => batches.map(b => b.batchNo), [batches]);
  const [tab, setTab] = useState<typeof TABS[number]>('Task management');
  const [records, setRecords] = useState<TaskRecord[]>(initialTaskRecords);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewTask, setViewTask] = useState<TaskRecord | null>(null);
  const [managementBatchFilter, setManagementBatchFilter] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(EMPTY_FILTERS);
  const managementRows = useMemo(() => records.filter(t => !managementBatchFilter || managementBatchFilter === 'Batch' ? true : t.batchNo === managementBatchFilter), [records, managementBatchFilter]);

  // Task Report / Daily Task Sheet is a reporting surface for completed work
  // (per spec: "display completed task records"), so it's scoped to
  // status === 'completed' before any user-chosen filters are applied.
  const completedRecords = useMemo(() => records.filter(t => t.status === 'completed'), [records]);
  const reportRows = useMemo(() => {
    return completedRecords.filter(t => {
      if (appliedFilters.dateFrom && t.date < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && t.date > appliedFilters.dateTo) return false;
      if (appliedFilters.batch && appliedFilters.batch !== 'Batch' && t.batchNo !== appliedFilters.batch) return false;
      if (appliedFilters.trainees.length && !appliedFilters.trainees.includes(t.trainee)) return false;
      if (appliedFilters.trainers.length && !appliedFilters.trainers.includes(t.trainer)) return false;
      return true;
    });
  }, [completedRecords, appliedFilters]);
  const totalTimeSpent = reportRows.reduce((sum, t) => sum + t.timeSpent, 0);
  const applyFilters = () => setAppliedFilters(draftFilters);
  const cancelFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  };
  function handleAddTask(values: TaskFormValues) {
    const newTask: TaskRecord = {
      id: `tk-${Date.now()}`,
      batchNo: values.batchNo,
      task: values.task.trim(),
      description: values.description.trim(),
      timeGoal: Number(values.timeGoal),
      timeSpent: 0,
      trainee: values.trainee,
      trainer: values.trainer,
      date: values.date,
      status: 'open',
      onLeave: false
    };
    setRecords(prev => [newTask, ...prev]);
    setAddModalOpen(false);
    showToast(`Task "${newTask.task}" assigned to ${newTask.trainee}.`, 'success');
  }
  function requestAction(kind: NonNullable<PendingAction>['kind'], task: TaskRecord) {
    setPendingAction({
      kind,
      task
    });
  }
  function confirmPendingAction() {
    if (!pendingAction) return;
    const {
      kind,
      task
    } = pendingAction;
    if (kind === 'delete') {
      setRecords(prev => prev.filter(t => t.id !== task.id));
      showToast(`"${task.task}" was deleted.`, 'error');
    } else {
      const status = kind === 'complete' ? 'completed' : 'locked';
      setRecords(prev => prev.map(t => t.id === task.id ? {
        ...t,
        status
      } : t));
      showToast(`"${task.task}" ${kind === 'complete' ? 'marked as complete' : 'locked'}.`, 'success');
    }
    setPendingAction(null);
  }
  const updateTimeSpent = (id: string, value: number) => {
    setRecords(prev => prev.map(t => t.id === id ? {
      ...t,
      timeSpent: value
    } : t));
  };
  const updateRemarks = (id: string, value: string) => {
    setRecords(prev => prev.map(t => t.id === id ? {
      ...t,
      remarks: value
    } : t));
  };
  const commitRemarks = (task: TaskRecord) => {
    showToast(`Remarks saved for ${task.trainee}\u2019s "${task.task}".`, 'success');
  };
  const remarksFor = (t: TaskRecord) => t.onLeave ? t.leaveReason ?? 'On approved leave' : t.remarks ?? '';
  const dateRangeLabel = appliedFilters.dateFrom || appliedFilters.dateTo ? `${appliedFilters.dateFrom || 'Start'} \u2013 ${appliedFilters.dateTo || 'Present'}` : 'All dates';
  const printGeneratedAt = new Date().toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  return <div data-cy="index-div-1">
      <div className="mb-4 flex items-center justify-between no-print" data-cy="index-div-2">
        <div data-cy="index-div-3">
          <h1 className="text-xl font-semibold text-ink" data-cy="index-h1-tasks">Tasks</h1>
          <p className="text-sm text-neutral-500" data-cy="index-p-daily-trainee-task-assignment-and-reporting">Daily trainee task assignment and reporting</p>
        </div>
        {tab === 'Task management' && <Button variant="primary" icon={Plus} onClick={() => setAddModalOpen(true)} data-cy="index-button-set-add-modal-open">
            Add task
          </Button>}
      </div>

      <div className="mb-4 flex gap-5 border-b border-neutral-200 pl-0.5 no-print" data-cy="index-div-7">
        {TABS.map(t => <button key={t} onClick={() => setTab(t)} className={cn('pb-2.5 text-xs font-medium transition-colors', tab === t ? 'border-b-2 border-brand-500 text-ink font-semibold' : 'text-neutral-500 hover:text-neutral-700')} data-cy="index-button-set-tab">
            {t}
          </button>)}
      </div>

      {/* ── Task management ─────────────────────────────────────────── */}
      {tab === 'Task management' && <>
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3" data-cy="index-div-9">
            <Dropdown options={['Batch', ...batchNumbers]} placeholder="Batch" onChange={setManagementBatchFilter} className="sm:w-44" data-cy="index-dropdown-batch" />
            <span className="ml-auto text-xs text-neutral-400" data-cy="index-span-task">{managementRows.length} task{managementRows.length === 1 ? '' : 's'}</span>
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
                      <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-30">{t.batchNo}</td>
                      <td className="px-4 py-2.5 font-medium text-ink" data-cy="index-td-31">{t.task}</td>
                      <td className="px-4 py-2.5 max-w-[220px] truncate text-xs text-neutral-500" title={t.description} data-cy="index-td-t-description">{t.description}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-h">{t.timeGoal}h</td>
                      <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-34">{t.trainee}</td>
                      <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-35">{t.trainer}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-36">{t.date}</td>
                      <td className="px-4 py-2.5" data-cy="index-td-37">
                        <div className="flex justify-end gap-0.5" data-cy="index-div-38">
                          <TooltipIconButton icon={FolderOpen} label="Open" onClick={() => setViewTask(t)} data-cy="index-tooltip-icon-button-open" />
                          <TooltipIconButton icon={CheckCircle2} label="Complete" disabled={t.status === 'completed' || t.status === 'locked'} onClick={() => requestAction('complete', t)} data-cy="index-tooltip-icon-button-complete" />
                          <TooltipIconButton icon={Lock} label="Lock" disabled={t.status === 'locked'} onClick={() => requestAction('lock', t)} data-cy="index-tooltip-icon-button-lock" />
                          <TooltipIconButton icon={Trash2} label="Delete" danger onClick={() => requestAction('delete', t)} data-cy="index-tooltip-icon-button-delete" />
                        </div>
                      </td>
                    </tr>)}
                  {managementRows.length === 0 && <tr data-cy="index-tr-43">
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
                <button onClick={() => setViewTask(t)} className="flex w-full items-start justify-between gap-2 text-left" data-cy="index-button-set-view-task">
                  <div className="min-w-0" data-cy="index-div-48">
                    <p className="truncate text-sm font-semibold text-ink" data-cy="index-p-49">{t.task}</p>
                    <p className="truncate text-xs text-neutral-500" data-cy="index-p-50">
                      {t.batchNo} · {t.trainee}
                    </p>
                  </div>
                  <span className={cn('shrink-0 rounded-pill px-2 py-0.5 text-[11px] font-medium', STATUS_STYLE[t.status])} data-cy="index-span-51">
                    {STATUS_LABEL[t.status]}
                  </span>
                </button>
                <p className="mt-1.5 text-xs text-neutral-500" data-cy="index-p-52">
                  {t.trainer} · {t.timeGoal}h goal · {t.date}
                </p>
                <div className="mt-2.5 flex gap-2 border-t border-neutral-100 pt-2.5" data-cy="index-div-53">
                  <TooltipIconButton icon={CheckCircle2} label="Complete" disabled={t.status === 'completed' || t.status === 'locked'} onClick={() => requestAction('complete', t)} data-cy="index-tooltip-icon-button-complete-2" />
                  <TooltipIconButton icon={Lock} label="Lock" disabled={t.status === 'locked'} onClick={() => requestAction('lock', t)} data-cy="index-tooltip-icon-button-lock-2" />
                  <TooltipIconButton icon={Trash2} label="Delete" danger onClick={() => requestAction('delete', t)} data-cy="index-tooltip-icon-button-delete-2" />
                </div>
              </div>)}
            {managementRows.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400" data-cy="index-div-no-tasks-match-this-filter">
                No tasks match this filter.
              </div>}
          </div>
        </>}

      {/* ── Daily task sheet ─────────────────────────────────────────── */}
      {tab === 'Daily task sheet' && <>
          <div className="mb-3 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3 no-print" data-cy="index-div-58">
            <div className="flex flex-wrap items-end gap-2" data-cy="index-div-59">
              <div data-cy="index-div-60">
                <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="index-label-date-from">Date from</label>
                <input type="date" value={draftFilters.dateFrom} onChange={e => setDraftFilters(f => ({
              ...f,
              dateFrom: e.target.value
            }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="index-input-date" />
              </div>
              <div data-cy="index-div-63">
                <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="index-label-date-to">Date to</label>
                <input type="date" value={draftFilters.dateTo} onChange={e => setDraftFilters(f => ({
              ...f,
              dateTo: e.target.value
            }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="index-input-date-2" />
              </div>
              <div className="w-full sm:w-44" data-cy="index-div-66">
                <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="index-label-batch">Batch</label>
                <Dropdown options={['Batch', ...batchNumbers]} value={draftFilters.batch} placeholder="Batch" onChange={v => setDraftFilters(f => ({
              ...f,
              batch: v
            }))} data-cy="index-dropdown-batch-2" />
              </div>
              <div className="w-full sm:w-52" data-cy="index-div-69">
                <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="index-label-trainee">Trainee</label>
                <MultiSelectDropdown options={traineeNames} value={draftFilters.trainees} placeholder="Trainee" onChange={v => setDraftFilters(f => ({
              ...f,
              trainees: v
            }))} data-cy="index-multi-select-dropdown-trainee" />
              </div>
              <div className="w-full sm:w-52" data-cy="index-div-72">
                <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="index-label-trainer">Trainer</label>
                <MultiSelectDropdown options={trainerNames} value={draftFilters.trainers} placeholder="Trainer" onChange={v => setDraftFilters(f => ({
              ...f,
              trainers: v
            }))} data-cy="index-multi-select-dropdown-trainer" />
              </div>
              <div className="ml-auto flex gap-2" data-cy="index-div-75">
                <Button variant="secondary" size="sm" icon={X} onClick={cancelFilters} data-cy="index-button-cancel-filters">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={applyFilters} data-cy="index-button-apply-filters">
                  Filter
                </Button>
              </div>
            </div>
            <div className="flex items-start gap-1.5 text-[11px] text-neutral-400" data-cy="index-div-showing-completed-tasks-only-open-or">
              <Info size={12} className="mt-0.5 shrink-0" data-cy="index-info-79" />
              {"Showing completed tasks only. Open or locked tasks aren\u2019t part of the Daily Task Sheet report."}
            </div>
          </div>

          <div className="mb-3 flex items-center justify-between no-print" data-cy="index-div-80">
            <span className="text-xs text-neutral-500" data-cy="index-span-record">{reportRows.length} record{reportRows.length === 1 ? '' : 's'}</span>
            <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()} disabled={reportRows.length === 0} data-cy="index-button-82">
              Print daily task sheet
            </Button>
          </div>

          <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white no-print" data-cy="index-div-83">
            <div className="overflow-x-auto lss-scrollbar" data-cy="index-div-84">
              <table className="w-full min-w-[1020px] border-collapse text-sm" data-cy="index-table-85">
                <thead data-cy="index-thead-86">
                  <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="index-tr-87">
                    <th className="px-4 py-2.5 font-medium" data-cy="index-th-batch-2">Batch</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="index-th-task-2">Task</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="index-th-description-2">Description</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="index-th-time-goal-2">Time goal</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="index-th-time-spent">Time spent</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="index-th-remarks">Remarks</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="index-th-trainee-2">Trainee</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="index-th-trainer-2">Trainer</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="index-th-date-2">Date</th>
                  </tr>
                </thead>
                <tbody data-cy="index-tbody-97">
                  {reportRows.map(t => <tr key={t.id} className="border-t border-neutral-100" data-cy="index-tr-98">
                      <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-99">{t.batchNo}</td>
                      <td className="px-4 py-2.5 font-medium text-ink" data-cy="index-td-100">{t.task}</td>
                      <td className="px-4 py-2.5 max-w-[200px] truncate text-xs text-neutral-500" title={t.description} data-cy="index-td-t-description-2">{t.description}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-h-2">{t.timeGoal}h</td>
                      <td className="px-4 py-2.5" data-cy="index-td-103">
                        {t.onLeave ? <span className="font-mono text-xs text-neutral-400" data-cy="index-span-0h">0h</span> : <input type="number" min={0} value={t.timeSpent} onChange={e => updateTimeSpent(t.id, Number(e.target.value))} className="h-8 w-16 rounded-md border border-neutral-200 px-2 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="index-input-number" />}
                      </td>
                      <td className="px-4 py-2.5 max-w-[220px]" data-cy="index-td-106">
                        {t.onLeave ? <span className="inline-flex items-center rounded-pill bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600" title={remarksFor(t)} data-cy="index-span-107">
                            {remarksFor(t)}
                          </span> : <input type="text" defaultValue={t.remarks ?? ''} placeholder="Add remarks..." onChange={e => updateRemarks(t.id, e.target.value)} onBlur={e => {
                    if (e.target.value.trim() !== (t.remarks ?? '').trim()) commitRemarks({
                      ...t,
                      remarks: e.target.value
                    });
                  }} className="h-8 w-full min-w-[140px] rounded-md border border-transparent px-2 text-xs text-neutral-600 transition-colors hover:border-neutral-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="index-input-add-remarks" />}
                      </td>
                      <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-109">{t.trainee}</td>
                      <td className="px-4 py-2.5 text-neutral-600" data-cy="index-td-110">{t.trainer}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="index-td-111">{t.date}</td>
                    </tr>)}
                  {reportRows.length === 0 && <tr data-cy="index-tr-112">
                      <td colSpan={9} className="px-4 py-10 text-center text-xs text-neutral-400" data-cy="index-td-no-completed-records-match-your-filters">
                        No completed records match your filters.
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-3 flex justify-end text-xs text-neutral-500 no-print" data-cy="index-div-total-time-spent-filtered">
            Total time spent (filtered): <span className="ml-1 font-mono font-semibold text-ink" data-cy="index-span-h">{totalTimeSpent}h</span>
          </div>

          <DailyTaskSheetPrint rows={reportRows} generatedAt={printGeneratedAt} dateRangeLabel={dateRangeLabel} data-cy="index-daily-task-sheet-print-116" />
        </>}

      {/* ── Add task modal ──────────────────────────────────────────── */}
      <AddTaskModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onSave={handleAddTask} batchOptions={batchNumbers} traineeOptions={traineeNames} trainerOptions={trainerNames} data-cy="index-add-task-modal-set-add-modal-open" />

      {/* ── View task modal ("Open" action) ─────────────────────────── */}
      <Modal open={!!viewTask} onClose={() => setViewTask(null)} title={viewTask?.task ?? ''} maxWidth={440} data-cy="index-modal-set-view-task">
        {viewTask && <div className="flex flex-col gap-3 text-sm" data-cy="index-div-119">
            <div className="flex items-center gap-2" data-cy="index-div-120">
              <span className={cn('inline-flex items-center rounded-pill px-2.5 py-0.5 text-xs font-medium', STATUS_STYLE[viewTask.status])} data-cy="index-span-121">
                {STATUS_LABEL[viewTask.status]}
              </span>
              <span className="font-mono text-xs text-neutral-500" data-cy="index-span-122">{viewTask.batchNo}</span>
            </div>
            <p className="text-neutral-600" data-cy="index-p-123">{viewTask.description}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-md bg-neutral-50 p-3 text-xs" data-cy="index-div-124">
              <div data-cy="index-div-125"><span className="text-neutral-500" data-cy="index-span-trainee">Trainee</span><div className="font-medium text-ink" data-cy="index-div-127">{viewTask.trainee}</div></div>
              <div data-cy="index-div-128"><span className="text-neutral-500" data-cy="index-span-trainer">Trainer</span><div className="font-medium text-ink" data-cy="index-div-130">{viewTask.trainer}</div></div>
              <div data-cy="index-div-131"><span className="text-neutral-500" data-cy="index-span-date">Date</span><div className="font-mono font-medium text-ink" data-cy="index-div-133">{viewTask.date}</div></div>
              <div data-cy="index-div-134"><span className="text-neutral-500" data-cy="index-span-time-goal">Time goal</span><div className="font-mono font-medium text-ink" data-cy="index-div-h">{viewTask.timeGoal}h</div></div>
              <div data-cy="index-div-137"><span className="text-neutral-500" data-cy="index-span-time-spent">Time spent</span><div className="font-mono font-medium text-ink" data-cy="index-div-139">{viewTask.onLeave ? '0h' : `${viewTask.timeSpent}h`}</div></div>
            </div>
            <div data-cy="index-div-140">
              <label className="mb-1.5 block text-xs font-medium text-neutral-600" data-cy="index-label-remarks">Remarks</label>
              {viewTask.onLeave ? <span className="inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600" data-cy="index-span-142">
                  {remarksFor(viewTask)}
                </span> : <textarea key={viewTask.id} defaultValue={viewTask.remarks ?? ''} placeholder="Add remarks..." rows={3} onChange={e => updateRemarks(viewTask.id, e.target.value)} className="w-full resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="index-textarea-add-remarks" />}
            </div>
            <div className="mt-1 flex justify-end gap-2" data-cy="index-div-144">
              <Button variant="secondary" onClick={() => setViewTask(null)} data-cy="index-button-set-view-task-2">Close</Button>
              {!viewTask.onLeave && <Button variant="primary" onClick={() => {
            commitRemarks(viewTask);
            setViewTask(null);
          }} data-cy="index-button-commit-remarks">
                  Save remarks
                </Button>}
            </div>
          </div>}
      </Modal>

      {/* ── Confirm status change / delete ──────────────────────────── */}
      <ConfirmDialog open={!!pendingAction} onClose={() => setPendingAction(null)} onConfirm={confirmPendingAction} title={pendingAction ? ACTION_COPY[pendingAction.kind].title : ''} description={pendingAction ? ACTION_COPY[pendingAction.kind].body(pendingAction.task.task) : ''} confirmLabel={pendingAction ? ACTION_COPY[pendingAction.kind].confirmLabel : 'Confirm'} tone={pendingAction ? ACTION_COPY[pendingAction.kind].tone : 'default'} data-cy="index-confirm-dialog-set-pending-action" />
    </div>;
}