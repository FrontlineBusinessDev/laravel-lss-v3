import { useMemo, useState } from 'react';
import { History, Printer, ClipboardList } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { StatCard } from '@/components/StatCard';
import { RatingInput } from '@/components/RatingInput';
import { useToast } from '@/components/Toast';
import {
    taskRecords,
    taskRatingRecords as initialRatings,
    TODAY,
    currentUser,
} from '@/data/mockData';
import { useBatches } from '@/context/BatchesContext';
import type { TaskRating } from '@/types';
import { toDateInputValue } from '@/lib/utils';
import { RatingSheetPrint } from '@/pages/developer/ratings/RatingSheetPrint';

export default function TaskRatingPage() {
    const { batches, trainees } = useBatches();
    const { showToast } = useToast();
    const [ratings, setRatings] = useState<TaskRating[]>(initialRatings);

    const [batchNo, setBatchNo] = useState('');
    const [taskName, setTaskName] = useState('');
    const [draftByTrainee, setDraftByTrainee] = useState<
        Record<string, { rating: number; comments: string }>
    >({});
    const [historyFor, setHistoryFor] = useState<TaskRating | null>(null);

    const taskOptions = useMemo(() => {
        if (!batchNo) return [];
        return [
            ...new Set(
                taskRecords
                    .filter((t) => t.batchNo === batchNo)
                    .map((t) => t.task),
            ),
        ];
    }, [batchNo]);

    const batchTrainees = useMemo(
        () => trainees.filter((t) => t.batchNo === batchNo && !t.archived),
        [batchNo],
    );

    const ratingsForTask = useMemo(
        () =>
            ratings.filter(
                (r) => r.batchNo === batchNo && r.taskName === taskName,
            ),
        [ratings, batchNo, taskName],
    );

    const average = ratingsForTask.length
        ? ratingsForTask.reduce((sum, r) => sum + r.rating, 0) /
          ratingsForTask.length
        : 0;

    function draftFor(traineeId: string, existing?: TaskRating) {
        return (
            draftByTrainee[traineeId] ?? {
                rating: existing?.rating ?? 0,
                comments: existing?.comments ?? '',
            }
        );
    }

    function setDraft(
        traineeId: string,
        patch: Partial<{ rating: number; comments: string }>,
        existing?: TaskRating,
    ) {
        setDraftByTrainee((prev) => ({
            ...prev,
            [traineeId]: { ...draftFor(traineeId, existing), ...patch },
        }));
    }

    function saveRating(traineeId: string, traineeName: string) {
        const existing = ratings.find(
            (r) =>
                r.batchNo === batchNo &&
                r.taskName === taskName &&
                r.traineeId === traineeId,
        );
        const draft = draftFor(traineeId, existing);
        if (!draft.rating) {
            showToast(
                'Enter a rating between 1 and 100 before saving.',
                'error',
            );
            return;
        }
        const ratedAt = toDateInputValue(TODAY);
        const historyEntry = {
            rating: draft.rating,
            comments: draft.comments,
            evaluator: currentUser.name,
            ratedAt,
        };

        setRatings((prev) => {
            if (existing) {
                return prev.map((r) =>
                    r.id === existing.id
                        ? {
                              ...r,
                              rating: draft.rating,
                              comments: draft.comments,
                              evaluator: currentUser.name,
                              ratedAt,
                              history: [...r.history, historyEntry],
                          }
                        : r,
                );
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
                history: [historyEntry],
            };
            return [...prev, created];
        });
        showToast(
            existing
                ? `Rating updated for ${traineeName}.`
                : `Rating saved for ${traineeName}.`,
            'success',
        );
    }

    const canPrint = !!taskName && ratingsForTask.length > 0;

    return (
        <div>
            <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-neutral-500">
                    Evaluate trainees on completed tasks, projects, and
                    deliverables.
                </p>
                <Button
                    variant="secondary"
                    size="sm"
                    icon={Printer}
                    disabled={!canPrint}
                    onClick={() => window.print()}
                >
                    Print rating sheet
                </Button>
            </div>

            {/* Step 1 + 2 — Batch → Task/Project */}
            <div className="no-print mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-3.5">
                <div className="w-56">
                    <label className="mb-1 block text-[11px] font-medium text-neutral-500">
                        1. Batch
                    </label>
                    <Dropdown
                        options={[
                            'Select batch',
                            ...batches.map((b) => b.batchNo),
                        ]}
                        value={batchNo}
                        placeholder="Select batch"
                        onChange={(v) => {
                            setBatchNo(v === 'Select batch' ? '' : v);
                            setTaskName('');
                            setDraftByTrainee({});
                        }}
                    />
                </div>
                <div className="w-64">
                    <label className="mb-1 block text-[11px] font-medium text-neutral-500">
                        2. Task / project
                    </label>
                    <Dropdown
                        options={
                            taskOptions.length
                                ? ['Select task', ...taskOptions]
                                : ['No tasks for this batch']
                        }
                        value={taskName}
                        placeholder="Select task"
                        onChange={(v) => {
                            setTaskName(
                                v === 'Select task' ||
                                    v === 'No tasks for this batch'
                                    ? ''
                                    : v,
                            );
                            setDraftByTrainee({});
                        }}
                    />
                </div>
                {taskName && (
                    <StatCard
                        label="Task average rating"
                        value={average ? `${average.toFixed(1)} / 100` : '—'}
                        tone="accent"
                        className="w-44"
                    />
                )}
            </div>

            {!batchNo && (
                <div className="no-print rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
                    <ClipboardList
                        size={22}
                        className="mx-auto mb-2 text-neutral-300"
                    />
                    Select a batch, then a task or project, to start rating
                    trainees.
                </div>
            )}

            {batchNo && !taskName && (
                <div className="no-print rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
                    {taskOptions.length === 0
                        ? 'This batch has no tasks yet. Add tasks in Task Module › Task Management first.'
                        : 'Select a task or project to view and rate trainees in this batch.'}
                </div>
            )}

            {/* Step 3 + 4 — Trainees → Ratings */}
            {batchNo && taskName && (
                <>
                    <div className="no-print mb-3 rounded-lg border border-neutral-200 bg-brand-50 px-4 py-3">
                        <div className="text-[11px] font-medium tracking-wide text-brand-600 uppercase">
                            Rating task
                        </div>
                        <div className="text-lg font-semibold text-ink">
                            {taskName}
                        </div>
                    </div>

                    <div className="no-print hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block">
                        <div className="lss-scrollbar overflow-x-auto">
                            <table className="w-full min-w-[720px] border-collapse text-sm">
                                <thead>
                                    <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                                        <th className="px-4 py-2.5 font-medium">
                                            Trainee
                                        </th>
                                        <th className="px-4 py-2.5 font-medium">
                                            Rating
                                        </th>
                                        <th className="px-4 py-2.5 font-medium">
                                            Comments (optional)
                                        </th>
                                        <th className="px-4 py-2.5 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batchTrainees.map((tr) => {
                                        const existing = ratingsForTask.find(
                                            (r) => r.traineeId === tr.id,
                                        );
                                        const draft = draftFor(tr.id, existing);
                                        return (
                                            <tr
                                                key={tr.id}
                                                className="border-t border-neutral-100 align-top"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-ink">
                                                        {tr.name}
                                                    </div>
                                                    <div className="text-xs text-neutral-400">
                                                        {tr.school}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <RatingInput
                                                        value={draft.rating}
                                                        onChange={(v) =>
                                                            setDraft(
                                                                tr.id,
                                                                { rating: v },
                                                                existing,
                                                            )
                                                        }
                                                    />
                                                    {existing && (
                                                        <div className="mt-1 text-[11px] text-neutral-400">
                                                            Last saved{' '}
                                                            {existing.ratedAt}{' '}
                                                            by{' '}
                                                            {existing.evaluator}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <textarea
                                                        rows={2}
                                                        value={draft.comments}
                                                        onChange={(e) =>
                                                            setDraft(
                                                                tr.id,
                                                                {
                                                                    comments:
                                                                        e.target
                                                                            .value,
                                                                },
                                                                existing,
                                                            )
                                                        }
                                                        placeholder="Feedback for this trainee on this task..."
                                                        className="w-full min-w-[220px] resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-ink transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                                    />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() =>
                                                                saveRating(
                                                                    tr.id,
                                                                    tr.name,
                                                                )
                                                            }
                                                        >
                                                            {existing
                                                                ? 'Update'
                                                                : 'Save'}
                                                        </Button>
                                                        {existing &&
                                                            existing.history
                                                                .length > 0 && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    icon={
                                                                        History
                                                                    }
                                                                    onClick={() =>
                                                                        setHistoryFor(
                                                                            existing,
                                                                        )
                                                                    }
                                                                >
                                                                    History
                                                                </Button>
                                                            )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {batchTrainees.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-4 py-10 text-center text-xs text-neutral-400"
                                            >
                                                No trainees found in this batch.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile stacked cards — same rating form, one trainee per card */}
                    <div className="no-print flex flex-col gap-3 sm:hidden">
                        {batchTrainees.map((tr) => {
                            const existing = ratingsForTask.find(
                                (r) => r.traineeId === tr.id,
                            );
                            const draft = draftFor(tr.id, existing);
                            return (
                                <div
                                    key={tr.id}
                                    className="rounded-lg border border-neutral-200 bg-white p-3.5"
                                >
                                    <div className="mb-2">
                                        <div className="font-medium text-ink">
                                            {tr.name}
                                        </div>
                                        <div className="text-xs text-neutral-400">
                                            {tr.school}
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <RatingInput
                                            value={draft.rating}
                                            onChange={(v) =>
                                                setDraft(
                                                    tr.id,
                                                    { rating: v },
                                                    existing,
                                                )
                                            }
                                        />
                                        {existing && (
                                            <div className="mt-1 text-[11px] text-neutral-400">
                                                Last saved {existing.ratedAt} by{' '}
                                                {existing.evaluator}
                                            </div>
                                        )}
                                    </div>
                                    <textarea
                                        rows={2}
                                        value={draft.comments}
                                        onChange={(e) =>
                                            setDraft(
                                                tr.id,
                                                { comments: e.target.value },
                                                existing,
                                            )
                                        }
                                        placeholder="Feedback for this trainee on this task..."
                                        className="mb-2.5 w-full resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-ink transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="flex-1"
                                            onClick={() =>
                                                saveRating(tr.id, tr.name)
                                            }
                                        >
                                            {existing ? 'Update' : 'Save'}
                                        </Button>
                                        {existing &&
                                            existing.history.length > 0 && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    icon={History}
                                                    onClick={() =>
                                                        setHistoryFor(existing)
                                                    }
                                                >
                                                    History
                                                </Button>
                                            )}
                                    </div>
                                </div>
                            );
                        })}
                        {batchTrainees.length === 0 && (
                            <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400">
                                No trainees found in this batch.
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* History modal */}
            <Modal
                open={!!historyFor}
                onClose={() => setHistoryFor(null)}
                title={`Rating history \u2013 ${historyFor?.traineeName ?? ''}`}
                maxWidth={480}
            >
                {historyFor && (
                    <div className="flex flex-col gap-2.5">
                        <p className="mb-1 text-xs text-neutral-500">
                            {historyFor.taskName} · {historyFor.batchNo}
                        </p>
                        {[...historyFor.history].reverse().map((h, i) => (
                            <div
                                key={i}
                                className="rounded-md border border-neutral-200 p-3"
                            >
                                <div className="mb-1 flex items-center justify-between">
                                    <RatingInput value={h.rating} />
                                    <span className="text-[11px] text-neutral-400">
                                        {h.ratedAt}
                                    </span>
                                </div>
                                {h.comments && (
                                    <p className="text-xs text-neutral-600">
                                        {h.comments}
                                    </p>
                                )}
                                <div className="mt-1 text-[11px] text-neutral-400">
                                    Evaluated by {h.evaluator}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>

            {/* Print layout */}
            {taskName && (
                <RatingSheetPrint
                    batchNo={batchNo}
                    taskName={taskName}
                    ratings={ratingsForTask}
                    average={average}
                    generatedAt={new Date().toLocaleString('en-PH', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                />
            )}
        </div>
    );
}
