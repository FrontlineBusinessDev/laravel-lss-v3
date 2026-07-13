import { useMemo, useState } from 'react';
import { History, Printer, ClipboardList } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { StatCard } from '@/components/StatCard';
import { RatingInput } from '@/components/RatingInput';
import { useToast } from '@/components/Toast';
import { taskRecords, taskRatingRecords as initialRatings, TODAY, currentUser } from '@/data/mockData';
import { useBatches } from '@/context/BatchesContext';
import type { TaskRating } from '@/types';
import { toDateInputValue } from '@/lib/utils';
import { RatingSheetPrint } from '@/pages/ratings/RatingSheetPrint';
export default function TaskRatingPage() {
  const {
    batches,
    trainees
  } = useBatches();
  const {
    showToast
  } = useToast();
  const [ratings, setRatings] = useState<TaskRating[]>(initialRatings);
  const [batchNo, setBatchNo] = useState('');
  const [taskName, setTaskName] = useState('');
  const [draftByTrainee, setDraftByTrainee] = useState<Record<string, {
    rating: number;
    comments: string;
  }>>({});
  const [historyFor, setHistoryFor] = useState<TaskRating | null>(null);
  const taskOptions = useMemo(() => {
    if (!batchNo) return [];
    return [...new Set(taskRecords.filter(t => t.batchNo === batchNo).map(t => t.task))];
  }, [batchNo]);
  const batchTrainees = useMemo(() => trainees.filter(t => t.batchNo === batchNo && !t.archived), [batchNo]);
  const ratingsForTask = useMemo(() => ratings.filter(r => r.batchNo === batchNo && r.taskName === taskName), [ratings, batchNo, taskName]);
  const average = ratingsForTask.length ? ratingsForTask.reduce((sum, r) => sum + r.rating, 0) / ratingsForTask.length : 0;
  function draftFor(traineeId: string, existing?: TaskRating) {
    return draftByTrainee[traineeId] ?? {
      rating: existing?.rating ?? 0,
      comments: existing?.comments ?? ''
    };
  }
  function setDraft(traineeId: string, patch: Partial<{
    rating: number;
    comments: string;
  }>, existing?: TaskRating) {
    setDraftByTrainee(prev => ({
      ...prev,
      [traineeId]: {
        ...draftFor(traineeId, existing),
        ...patch
      }
    }));
  }
  function saveRating(traineeId: string, traineeName: string) {
    const existing = ratings.find(r => r.batchNo === batchNo && r.taskName === taskName && r.traineeId === traineeId);
    const draft = draftFor(traineeId, existing);
    if (!draft.rating) {
      showToast('Enter a rating between 1 and 100 before saving.', 'error');
      return;
    }
    const ratedAt = toDateInputValue(TODAY);
    const historyEntry = {
      rating: draft.rating,
      comments: draft.comments,
      evaluator: currentUser.name,
      ratedAt
    };
    setRatings(prev => {
      if (existing) {
        return prev.map(r => r.id === existing.id ? {
          ...r,
          rating: draft.rating,
          comments: draft.comments,
          evaluator: currentUser.name,
          ratedAt,
          history: [...r.history, historyEntry]
        } : r);
      }
      const created: TaskRating = {
        id: `rt-${Date.now()}`,
        batchNo,
        taskName,
        traineeId,
        traineeName,
        rating: draft.rating,
        comments: draft.comments,
        evaluator: currentUser.name,
        ratedAt,
        history: [historyEntry]
      };
      return [...prev, created];
    });
    showToast(existing ? `Rating updated for ${traineeName}.` : `Rating saved for ${traineeName}.`, 'success');
  }
  const canPrint = !!taskName && ratingsForTask.length > 0;
  return <div data-cy="task-rating-page-div-1">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 no-print" data-cy="task-rating-page-div-2">
        <p className="text-sm text-neutral-500" data-cy="task-rating-page-p-evaluate-trainees-on-completed-tasks-projects">Evaluate trainees on completed tasks, projects, and deliverables.</p>
        <Button variant="secondary" size="sm" icon={Printer} disabled={!canPrint} onClick={() => window.print()} data-cy="task-rating-page-button-4">
          Print rating sheet
        </Button>
      </div>

      {/* Step 1 + 2 — Batch → Task/Project */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-3.5 no-print" data-cy="task-rating-page-div-5">
        <div className="w-56" data-cy="task-rating-page-div-6">
          <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="task-rating-page-label-1-batch">1. Batch</label>
          <Dropdown options={['Select batch', ...batches.map(b => b.batchNo)]} value={batchNo} placeholder="Select batch" onChange={v => {
          setBatchNo(v === 'Select batch' ? '' : v);
          setTaskName('');
          setDraftByTrainee({});
        }} data-cy="task-rating-page-dropdown-select-batch" />
        </div>
        <div className="w-64" data-cy="task-rating-page-div-9">
          <label className="mb-1 block text-[11px] font-medium text-neutral-500" data-cy="task-rating-page-label-2-task-project">2. Task / project</label>
          <Dropdown options={taskOptions.length ? ['Select task', ...taskOptions] : ['No tasks for this batch']} value={taskName} placeholder="Select task" onChange={v => {
          setTaskName(v === 'Select task' || v === 'No tasks for this batch' ? '' : v);
          setDraftByTrainee({});
        }} data-cy="task-rating-page-dropdown-select-task" />
        </div>
        {taskName && <StatCard label="Task average rating" value={average ? `${average.toFixed(1)} / 100` : '—'} tone="accent" className="w-44" data-cy="task-rating-page-stat-card-task-average-rating" />}
      </div>

      {!batchNo && <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500 no-print" data-cy="task-rating-page-div-select-a-batch-then-a-task">
          <ClipboardList size={22} className="mx-auto mb-2 text-neutral-300" data-cy="task-rating-page-clipboard-list-14" />
          Select a batch, then a task or project, to start rating trainees.
        </div>}

      {batchNo && !taskName && <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500 no-print" data-cy="task-rating-page-div-15">
          {taskOptions.length === 0 ? 'This batch has no tasks yet. Add tasks in Task Module › Task Management first.' : 'Select a task or project to view and rate trainees in this batch.'}
        </div>}

      {/* Step 3 + 4 — Trainees → Ratings */}
      {batchNo && taskName && <>
          <div className="mb-3 rounded-lg border border-neutral-200 bg-brand-50 px-4 py-3 no-print" data-cy="task-rating-page-div-16">
            <div className="text-[11px] font-medium uppercase tracking-wide text-brand-600" data-cy="task-rating-page-div-rating-task">Rating task</div>
            <div className="text-lg font-semibold text-ink" data-cy="task-rating-page-div-18">{taskName}</div>
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white no-print sm:block" data-cy="task-rating-page-div-19">
            <div className="overflow-x-auto lss-scrollbar" data-cy="task-rating-page-div-20">
              <table className="w-full min-w-[720px] border-collapse text-sm" data-cy="task-rating-page-table-21">
                <thead data-cy="task-rating-page-thead-22">
                  <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500" data-cy="task-rating-page-tr-23">
                    <th className="px-4 py-2.5 font-medium" data-cy="task-rating-page-th-trainee">Trainee</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="task-rating-page-th-rating">Rating</th>
                    <th className="px-4 py-2.5 font-medium" data-cy="task-rating-page-th-comments-optional">Comments (optional)</th>
                    <th className="px-4 py-2.5 font-medium text-right" data-cy="task-rating-page-th-actions">Actions</th>
                  </tr>
                </thead>
                <tbody data-cy="task-rating-page-tbody-28">
                  {batchTrainees.map(tr => {
                const existing = ratingsForTask.find(r => r.traineeId === tr.id);
                const draft = draftFor(tr.id, existing);
                return <tr key={tr.id} className="border-t border-neutral-100 align-top" data-cy="task-rating-page-tr-29">
                        <td className="px-4 py-3" data-cy="task-rating-page-td-30">
                          <div className="font-medium text-ink" data-cy="task-rating-page-div-31">{tr.name}</div>
                          <div className="text-xs text-neutral-400" data-cy="task-rating-page-div-32">{tr.school}</div>
                        </td>
                        <td className="px-4 py-3" data-cy="task-rating-page-td-33">
                          <RatingInput value={draft.rating} onChange={v => setDraft(tr.id, {
                      rating: v
                    }, existing)} data-cy="task-rating-page-rating-input-set-draft" />
                          {existing && <div className="mt-1 text-[11px] text-neutral-400" data-cy="task-rating-page-div-last-saved">Last saved {existing.ratedAt} by {existing.evaluator}</div>}
                        </td>
                        <td className="px-4 py-3" data-cy="task-rating-page-td-36">
                          <textarea rows={2} value={draft.comments} onChange={e => setDraft(tr.id, {
                      comments: e.target.value
                    }, existing)} placeholder="Feedback for this trainee on this task..." className="w-full min-w-[220px] resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="task-rating-page-textarea-set-draft" />
                        </td>
                        <td className="px-4 py-3" data-cy="task-rating-page-td-38">
                          <div className="flex flex-col items-end gap-1.5" data-cy="task-rating-page-div-39">
                            <Button size="sm" variant="primary" onClick={() => saveRating(tr.id, tr.name)} data-cy="task-rating-page-button-save-rating">
                              {existing ? 'Update' : 'Save'}
                            </Button>
                            {existing && existing.history.length > 0 && <Button size="sm" variant="ghost" icon={History} onClick={() => setHistoryFor(existing)} data-cy="task-rating-page-button-set-history-for">
                                History
                              </Button>}
                          </div>
                        </td>
                      </tr>;
              })}
                  {batchTrainees.length === 0 && <tr data-cy="task-rating-page-tr-42">
                      <td colSpan={4} className="px-4 py-10 text-center text-xs text-neutral-400" data-cy="task-rating-page-td-no-trainees-found-in-this-batch">
                        No trainees found in this batch.
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile stacked cards — same rating form, one trainee per card */}
          <div className="flex flex-col gap-3 no-print sm:hidden" data-cy="task-rating-page-div-44">
            {batchTrainees.map(tr => {
          const existing = ratingsForTask.find(r => r.traineeId === tr.id);
          const draft = draftFor(tr.id, existing);
          return <div key={tr.id} className="rounded-lg border border-neutral-200 bg-white p-3.5" data-cy="task-rating-page-div-45">
                  <div className="mb-2" data-cy="task-rating-page-div-46">
                    <div className="font-medium text-ink" data-cy="task-rating-page-div-47">{tr.name}</div>
                    <div className="text-xs text-neutral-400" data-cy="task-rating-page-div-48">{tr.school}</div>
                  </div>
                  <div className="mb-2" data-cy="task-rating-page-div-49">
                    <RatingInput value={draft.rating} onChange={v => setDraft(tr.id, {
                rating: v
              }, existing)} data-cy="task-rating-page-rating-input-set-draft-2" />
                    {existing && <div className="mt-1 text-[11px] text-neutral-400" data-cy="task-rating-page-div-last-saved-2">Last saved {existing.ratedAt} by {existing.evaluator}</div>}
                  </div>
                  <textarea rows={2} value={draft.comments} onChange={e => setDraft(tr.id, {
              comments: e.target.value
            }, existing)} placeholder="Feedback for this trainee on this task..." className="mb-2.5 w-full resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" data-cy="task-rating-page-textarea-set-draft-2" />
                  <div className="flex gap-2" data-cy="task-rating-page-div-53">
                    <Button size="sm" variant="primary" className="flex-1" onClick={() => saveRating(tr.id, tr.name)} data-cy="task-rating-page-button-save-rating-2">
                      {existing ? 'Update' : 'Save'}
                    </Button>
                    {existing && existing.history.length > 0 && <Button size="sm" variant="ghost" icon={History} onClick={() => setHistoryFor(existing)} data-cy="task-rating-page-button-set-history-for-2">
                        History
                      </Button>}
                  </div>
                </div>;
        })}
            {batchTrainees.length === 0 && <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400" data-cy="task-rating-page-div-no-trainees-found-in-this-batch">
                No trainees found in this batch.
              </div>}
          </div>
        </>}

      {/* History modal */}
      <Modal open={!!historyFor} onClose={() => setHistoryFor(null)} title={`Rating history \u2013 ${historyFor?.traineeName ?? ''}`} maxWidth={480} data-cy="task-rating-page-modal-set-history-for">
        {historyFor && <div className="flex flex-col gap-2.5" data-cy="task-rating-page-div-58">
            <p className="mb-1 text-xs text-neutral-500" data-cy="task-rating-page-p-59">{historyFor.taskName} · {historyFor.batchNo}</p>
            {[...historyFor.history].reverse().map((h, i) => <div key={i} className="rounded-md border border-neutral-200 p-3" data-cy="task-rating-page-div-60">
                <div className="mb-1 flex items-center justify-between" data-cy="task-rating-page-div-61">
                  <RatingInput value={h.rating} data-cy="task-rating-page-rating-input-62" />
                  <span className="text-[11px] text-neutral-400" data-cy="task-rating-page-span-63">{h.ratedAt}</span>
                </div>
                {h.comments && <p className="text-xs text-neutral-600" data-cy="task-rating-page-p-64">{h.comments}</p>}
                <div className="mt-1 text-[11px] text-neutral-400" data-cy="task-rating-page-div-evaluated-by">Evaluated by {h.evaluator}</div>
              </div>)}
          </div>}
      </Modal>

      {/* Print layout */}
      {taskName && <RatingSheetPrint batchNo={batchNo} taskName={taskName} ratings={ratingsForTask} average={average} generatedAt={new Date().toLocaleString('en-PH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    })} data-cy="task-rating-page-rating-sheet-print-66" />}
    </div>;
}