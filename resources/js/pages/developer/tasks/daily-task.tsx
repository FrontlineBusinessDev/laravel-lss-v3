import { useCallback, useEffect, useMemo, useState } from 'react';
import { Printer, X, Info } from 'lucide-react';
import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { MultiSelectDropdown } from '@/components/MultiSelectDropdown';
import { useToast } from '@/hooks/use-toast';
import { apiFetchJson } from '@/lib/apiFetch';
import TasksPrimaryLayout from '@/layouts/tasks/TasksPrimaryLayout';
import { DailyTaskSheetPrint } from '@/pages/developer/tasks/DailyTaskSheetPrint';
import type { TaskRecord } from '@/types';

interface ApiDailyTaskRow {
  id: number;
  batch_code: string | null;
  task: string;
  description: string | null;
  time_goal: number;
  time_spent: number;
  remarks: string | null;
  trainee: string;
  trainer: string;
  date: string;
  on_leave: boolean;
  leave_reason: string | null;
}
interface BatchOption {
  id: number;
  batch_code: string;
}
interface PersonOption {
  id: number;
  first_name: string;
  last_name: string;
}
function personLabel(p: PersonOption): string {
  return `${p.first_name} ${p.last_name}`.trim();
}
function toRecord(r: ApiDailyTaskRow): TaskRecord {
  return {
    id: String(r.id),
    batchNo: r.batch_code ?? '',
    task: r.task,
    description: r.description ?? '',
    timeGoal: Number(r.time_goal),
    timeSpent: Number(r.time_spent),
    trainee: r.trainee,
    trainer: r.trainer,
    date: r.date?.slice(0, 10),
    status: 'completed',
    onLeave: r.on_leave,
    leaveReason: r.leave_reason ?? undefined,
    remarks: r.remarks ?? undefined
  };
}

/** Draft vs. applied filter state, per the Filter / Cancel workflow. */
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
export default function DailyTaskSheetPage() {
  const {
    toast
  } = useToast();
  const [rows, setRows] = useState<ApiDailyTaskRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [trainees, setTrainees] = useState<PersonOption[]>([]);
  const [trainers, setTrainers] = useState<PersonOption[]>([]);
  const [draftFilters, setDraftFilters] = useState<ReportFilters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<ReportFilters>(EMPTY_FILTERS);

  useEffect(() => {
    apiFetchJson<BatchOption[]>('/batches/lookup?status=active&per_page=50').then(res => setBatches(res.data ?? []));
    apiFetchJson<PersonOption[]>('/trainees/lookup?status=active&per_page=50').then(res => setTrainees(res.data ?? []));
    apiFetchJson<PersonOption[]>('/tasks/trainers').then(res => setTrainers(res.data ?? []));
  }, []);

  const loadReport = useCallback(async (filters: ReportFilters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dateFrom) params.set('date_from', filters.dateFrom);
      if (filters.dateTo) params.set('date_to', filters.dateTo);
      const batch = batches.find(b => b.batch_code === filters.batch);
      if (batch) params.set('batch_id', String(batch.id));
      trainees.filter(t => filters.trainees.includes(personLabel(t))).forEach(t => params.append('trainee_ids[]', String(t.id)));
      trainers.filter(t => filters.trainers.includes(personLabel(t))).forEach(t => params.append('trainer_ids[]', String(t.id)));
      const res = await apiFetchJson<ApiDailyTaskRow[]>(`/tasks/daily-task/list?${params.toString()}`);
      setRows(res.data ?? []);
    } catch {
      toast({ description: 'Failed to load the daily task sheet.', variant: 'error' });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batches, trainees, trainers]);

  const applyFilters = () => {
    setAppliedFilters(draftFilters);
    loadReport(draftFilters);
  };
  const cancelFilters = () => {
    setDraftFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setRows([]);
  };

  async function updateTimeSpent(id: number, value: number) {
    try {
      await apiFetchJson(`/tasks/${id}/time-spent`, {
        method: 'PATCH',
        body: JSON.stringify({
          time_spent: value
        })
      });
      setRows(prev => prev.map(r => r.id === id ? {
        ...r,
        time_spent: value
      } : r));
    } catch {
      toast({ description: 'Failed to update time spent.', variant: 'error' });
    }
  }
  async function updateRemarks(id: number, value: string) {
    try {
      await apiFetchJson(`/tasks/${id}/remarks`, {
        method: 'PATCH',
        body: JSON.stringify({
          remarks: value
        })
      });
      toast({ description: 'Remarks saved.', variant: 'success' });
    } catch {
      toast({ description: 'Failed to save remarks.', variant: 'error' });
    }
  }
  const reportRows = useMemo(() => rows.map(toRecord), [rows]);
  const totalTimeSpent = reportRows.reduce((sum, t) => sum + t.timeSpent, 0);
  const dateRangeLabel = appliedFilters.dateFrom || appliedFilters.dateTo ? `${appliedFilters.dateFrom || 'Start'} – ${appliedFilters.dateTo || 'Present'}` : 'All dates';
  const printGeneratedAt = new Date().toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  return <TasksPrimaryLayout data-cy="daily-task-tasks-primary-layout-1">
      <div data-cy="daily-task-div-1">
        <div className="mb-3 flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-3 no-print" data-cy="daily-task-div-58">
          <div className="flex flex-wrap items-end gap-2" data-cy="daily-task-div-59">
            <div data-cy="daily-task-div-60">
              <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="daily-task-label-date-from">Date from</label>
              <input type="date" value={draftFilters.dateFrom} onChange={e => setDraftFilters(f => ({
              ...f,
              dateFrom: e.target.value
            }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="daily-task-input-date" />
            </div>
            <div data-cy="daily-task-div-63">
              <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="daily-task-label-date-to">Date to</label>
              <input type="date" value={draftFilters.dateTo} onChange={e => setDraftFilters(f => ({
              ...f,
              dateTo: e.target.value
            }))} className="h-9 rounded-md border border-neutral-200 px-2.5 text-xs text-ink focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="daily-task-input-date-2" />
            </div>
            <div className="w-full sm:w-44" data-cy="daily-task-div-66">
              <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="daily-task-label-batch">Batch</label>
              <Dropdown options={['Batch', ...batches.map(b => b.batch_code)]} value={draftFilters.batch} placeholder="Batch" onChange={v => setDraftFilters(f => ({
              ...f,
              batch: v === 'Batch' ? '' : v
            }))} data-cy="daily-task-dropdown-batch-2" />
            </div>
            <div className="w-full sm:w-52" data-cy="daily-task-div-69">
              <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="daily-task-label-trainee">Trainee</label>
              <MultiSelectDropdown options={trainees.map(personLabel)} value={draftFilters.trainees} placeholder="Trainee" onChange={v => setDraftFilters(f => ({
              ...f,
              trainees: v
            }))} data-cy="daily-task-multi-select-dropdown-trainee" />
            </div>
            <div className="w-full sm:w-52" data-cy="daily-task-div-72">
              <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="daily-task-label-trainer">Trainer</label>
              <MultiSelectDropdown options={trainers.map(personLabel)} value={draftFilters.trainers} placeholder="Trainer" onChange={v => setDraftFilters(f => ({
              ...f,
              trainers: v
            }))} data-cy="daily-task-multi-select-dropdown-trainer" />
            </div>
            <div className="ml-auto flex gap-2" data-cy="daily-task-div-75">
              <Button variant="secondary" size="sm" icon={X} onClick={cancelFilters} data-cy="daily-task-button-cancel-filters">
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={applyFilters} data-cy="daily-task-button-apply-filters">
                Filter
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-neutral-400" data-cy="daily-task-div-showing-completed-tasks-only-open-or">
            <Info size={12} className="mt-0.5 shrink-0" data-cy="daily-task-info-79" />
            {'Showing completed tasks only. Open or locked tasks aren’t part of the Daily Task Sheet report.'}
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between no-print" data-cy="daily-task-div-80">
          <span className="text-xs text-neutral-500" data-cy="daily-task-span-record">{loading ? 'Loading…' : `${reportRows.length} record${reportRows.length === 1 ? '' : 's'}`}</span>
          <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()} disabled={reportRows.length === 0} data-cy="daily-task-button-82">
            Print daily task sheet
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-neutral-200 bg-white no-print" data-cy="daily-task-div-83">
          <div className="overflow-x-auto lss-scrollbar" data-cy="daily-task-div-84">
            <table className="w-full min-w-[1020px] border-collapse text-sm" data-cy="daily-task-table-85">
              <thead data-cy="daily-task-thead-86">
                <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="daily-task-tr-87">
                  <th className="px-4 py-2.5 font-medium" data-cy="daily-task-th-batch-2">Batch</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="daily-task-th-task-2">Task</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="daily-task-th-description-2">Description</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="daily-task-th-time-goal-2">Time goal</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="daily-task-th-time-spent">Time spent</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="daily-task-th-remarks">Remarks</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="daily-task-th-trainee-2">Trainee</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="daily-task-th-trainer-2">Trainer</th>
                  <th className="px-4 py-2.5 font-medium" data-cy="daily-task-th-date-2">Date</th>
                </tr>
              </thead>
              <tbody data-cy="daily-task-tbody-97">
                {reportRows.map(t => <tr key={t.id} className="border-t border-neutral-100" data-cy="daily-task-tr-98">
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="daily-task-td-99">{t.batchNo}</td>
                    <td className="px-4 py-2.5 font-medium text-ink" data-cy="daily-task-td-100">{t.task}</td>
                    <td className="px-4 py-2.5 max-w-[200px] truncate text-xs text-neutral-500" title={t.description} data-cy="daily-task-td-t-description-2">{t.description}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="daily-task-td-h-2">{t.timeGoal}h</td>
                    <td className="px-4 py-2.5" data-cy="daily-task-td-103">
                      {t.onLeave ? <span className="font-mono text-xs text-neutral-400" data-cy="daily-task-span-0h">0h</span> : <input type="number" min={0} value={t.timeSpent} onChange={e => updateTimeSpent(Number(t.id), Number(e.target.value))} className="h-8 w-16 rounded-md border border-neutral-200 px-2 font-mono text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="daily-task-input-number" />}
                    </td>
                    <td className="px-4 py-2.5 max-w-[220px]" data-cy="daily-task-td-106">
                      {t.onLeave ? <span className="inline-flex items-center rounded-pill bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600" title={t.leaveReason ?? ''} data-cy="daily-task-span-107">
                          {t.leaveReason}
                        </span> : <input type="text" defaultValue={t.remarks ?? ''} placeholder="Add remarks..." onBlur={e => {
                    if (e.target.value.trim() !== (t.remarks ?? '').trim()) updateRemarks(Number(t.id), e.target.value);
                  }} className="h-8 w-full min-w-[140px] rounded-md border border-transparent px-2 text-xs text-neutral-600 transition-colors hover:border-neutral-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="daily-task-input-add-remarks" />}
                    </td>
                    <td className="px-4 py-2.5 text-neutral-600" data-cy="daily-task-td-109">{t.trainee}</td>
                    <td className="px-4 py-2.5 text-neutral-600" data-cy="daily-task-td-110">{t.trainer}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-neutral-600" data-cy="daily-task-td-111">{t.date}</td>
                  </tr>)}
                {!loading && reportRows.length === 0 && <tr data-cy="daily-task-tr-112">
                    <td colSpan={9} className="px-4 py-10 text-center text-xs text-neutral-400" data-cy="daily-task-td-no-completed-records-match-your-filters">
                      No completed records match your filters.
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-3 flex justify-end text-xs text-neutral-500 no-print" data-cy="daily-task-div-total-time-spent-filtered">
          Total time spent (filtered): <span className="ml-1 font-mono font-semibold text-ink" data-cy="daily-task-span-h">{totalTimeSpent}h</span>
        </div>

        <DailyTaskSheetPrint rows={reportRows} generatedAt={printGeneratedAt} dateRangeLabel={dateRangeLabel} data-cy="daily-task-daily-task-sheet-print-116" />
      </div>
    </TasksPrimaryLayout>;
}
