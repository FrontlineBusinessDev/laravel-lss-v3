import { Button } from '@/components/Button';
import { Dropdown } from '@/components/Dropdown';
import { Modal } from '@/components/Modal';
import { RatingInput } from '@/components/RatingInput';
import { StatCard } from '@/components/StatCard';
import { useToast } from '@/hooks/use-toast';
import { apiFetchJson } from '@/lib/apiFetch';
import type { TaskRating, TaskRatingHistoryEntry } from '@/types';
import { ClipboardList, History, Printer } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { RatingSheetPrint } from './RatingSheetPrint';

interface BatchOption {
    id: number;
    batch_code: string;
}
interface PersonRef {
    id: number;
    first_name: string;
    last_name: string;
}
interface ApiTaskRating {
    id: number;
    batch_id: number;
    task_name: string;
    trainee_id: number;
    rating: number;
    comments: string | null;
    rated_at: string;
    trainee: PersonRef | null;
    evaluator: PersonRef | null;
}
interface ApiHistoryEntry {
    rating: number;
    comments: string | null;
    rated_at: string;
    evaluator: PersonRef | null;
}
function personName(p: PersonRef | null): string {
    return p ? `${p.first_name} ${p.last_name}`.trim() : '—';
}
function toTaskRating(r: ApiTaskRating): TaskRating {
    return {
        id: String(r.id),
        batchNo: '',
        taskName: r.task_name,
        traineeId: String(r.trainee_id),
        traineeName: personName(r.trainee),
        rating: r.rating,
        comments: r.comments ?? '',
        evaluator: personName(r.evaluator),
        ratedAt: r.rated_at?.slice(0, 10),
        history: [],
    };
}
function toHistoryEntry(h: ApiHistoryEntry): TaskRatingHistoryEntry {
    return {
        rating: h.rating,
        comments: h.comments ?? '',
        evaluator: personName(h.evaluator),
        ratedAt: h.rated_at?.slice(0, 10),
    };
}

export default function TaskRatingPage() {
    const { toast } = useToast();
    const [batches, setBatches] = useState<BatchOption[]>([]);
    const [batchTrainees, setBatchTrainees] = useState<PersonRef[]>([]);
    const [taskOptions, setTaskOptions] = useState<string[]>([]);
    const [ratings, setRatings] = useState<ApiTaskRating[]>([]);
    const [batchNo, setBatchNo] = useState('');
    const [taskName, setTaskName] = useState('');
    const [draftByTrainee, setDraftByTrainee] = useState<
        Record<
            string,
            {
                rating: number;
                comments: string;
            }
        >
    >({});
    const [historyFor, setHistoryFor] = useState<ApiTaskRating | null>(null);
    const [history, setHistory] = useState<TaskRatingHistoryEntry[]>([]);

    useEffect(() => {
        apiFetchJson<BatchOption[]>('/batches/lookup?status=active&per_page=50').then((res) =>
            setBatches(res.data ?? []),
        );
    }, []);

    const batchId = useMemo(
        () => batches.find((b) => b.batch_code === batchNo)?.id,
        [batches, batchNo],
    );

    useEffect(() => {
        if (!batchId) {
            setTaskOptions([]);
            setBatchTrainees([]);
            return;
        }
        apiFetchJson<string[]>(`/ratings/task-rating/task-options?batch_id=${batchId}`).then((res) =>
            setTaskOptions(res.data ?? []),
        );
        apiFetchJson<PersonRef[]>(`/ratings/task-rating/trainees?batch_id=${batchId}`).then((res) =>
            setBatchTrainees(res.data ?? []),
        );
    }, [batchId]);

    useEffect(() => {
        if (!batchId || !taskName) {
            setRatings([]);
            return;
        }
        apiFetchJson<ApiTaskRating[]>(
            `/ratings/task-rating?batch_id=${batchId}&task_name=${encodeURIComponent(taskName)}`,
        ).then((res) => setRatings(res.data ?? []));
    }, [batchId, taskName]);

    const ratingsForTask = useMemo(() => ratings.map(toTaskRating), [ratings]);
    const average = ratingsForTask.length
        ? ratingsForTask.reduce((sum, r) => sum + r.rating, 0) / ratingsForTask.length
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
        patch: Partial<{
            rating: number;
            comments: string;
        }>,
        existing?: TaskRating,
    ) {
        setDraftByTrainee((prev) => ({
            ...prev,
            [traineeId]: {
                ...draftFor(traineeId, existing),
                ...patch,
            },
        }));
    }
    async function saveRating(traineeId: string, traineeName: string) {
        if (!batchId) return;
        const existing = ratingsForTask.find((r) => r.traineeId === traineeId);
        const draft = draftFor(traineeId, existing);
        if (!draft.rating) {
            toast({ description: 'Enter a rating between 1 and 100 before saving.', variant: 'error' });
            return;
        }
        try {
            await apiFetchJson('/ratings/task-rating', {
                method: 'POST',
                body: JSON.stringify({
                    batch_id: batchId,
                    task_name: taskName,
                    trainee_id: Number(traineeId),
                    rating: draft.rating,
                    comments: draft.comments,
                }),
            });
            const res = await apiFetchJson<ApiTaskRating[]>(
                `/ratings/task-rating?batch_id=${batchId}&task_name=${encodeURIComponent(taskName)}`,
            );
            setRatings(res.data ?? []);
            toast({
                description: existing ? `Rating updated for ${traineeName}.` : `Rating saved for ${traineeName}.`,
                variant: 'success',
            });
        } catch {
            toast({ description: 'Failed to save rating.', variant: 'error' });
        }
    }
    async function openHistory(rating: ApiTaskRating) {
        setHistoryFor(rating);
        try {
            const res = await apiFetchJson<ApiHistoryEntry[]>(`/ratings/task-rating/${rating.id}/history`);
            setHistory((res.data ?? []).map(toHistoryEntry));
        } catch {
            setHistory([]);
        }
    }
    const canPrint = !!taskName && ratingsForTask.length > 0;
    return (
        <div data-cy="task-rating-page-div-1">
            <div
                className="no-print mb-4 flex flex-wrap items-center justify-between gap-3"
                data-cy="task-rating-page-div-2"
            >
                <p
                    className="text-sm text-neutral-500"
                    data-cy="task-rating-page-p-evaluate-trainees-on-completed-tasks-projects"
                >
                    Evaluate trainees on completed tasks, projects, and
                    deliverables.
                </p>
                <Button
                    variant="secondary"
                    size="sm"
                    icon={Printer}
                    disabled={!canPrint}
                    onClick={() => window.print()}
                    data-cy="task-rating-page-button-4"
                >
                    Print rating sheet
                </Button>
            </div>

            {/* Step 1 + 2 — Batch → Task/Project */}
            <div
                className="no-print mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-3.5"
                data-cy="task-rating-page-div-5"
            >
                <div className="w-56" data-cy="task-rating-page-div-6">
                    <label
                        className="mb-1 block text-[11px] font-medium text-neutral-500"
                        data-cy="task-rating-page-label-1-batch"
                    >
                        1. Batch
                    </label>
                    <Dropdown
                        options={[
                            'Select batch',
                            ...batches.map((b) => b.batch_code),
                        ]}
                        value={batchNo}
                        placeholder="Select batch"
                        onChange={(v) => {
                            setBatchNo(v === 'Select batch' ? '' : v);
                            setTaskName('');
                            setDraftByTrainee({});
                        }}
                        data-cy="task-rating-page-dropdown-select-batch"
                    />
                </div>
                <div className="w-64" data-cy="task-rating-page-div-9">
                    <label
                        className="mb-1 block text-[11px] font-medium text-neutral-500"
                        data-cy="task-rating-page-label-2-task-project"
                    >
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
                        data-cy="task-rating-page-dropdown-select-task"
                    />
                </div>
                {taskName && (
                    <StatCard
                        label="Task average rating"
                        value={average ? `${average.toFixed(1)} / 100` : '—'}
                        tone="accent"
                        className="w-44"
                        data-cy="task-rating-page-stat-card-task-average-rating"
                    />
                )}
            </div>

            {!batchNo && (
                <div
                    className="no-print rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500"
                    data-cy="task-rating-page-div-select-a-batch-then-a-task"
                >
                    <ClipboardList
                        size={22}
                        className="mx-auto mb-2 text-neutral-300"
                        data-cy="task-rating-page-clipboard-list-14"
                    />
                    Select a batch, then a task or project, to start rating
                    trainees.
                </div>
            )}

            {batchNo && !taskName && (
                <div
                    className="no-print rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500"
                    data-cy="task-rating-page-div-15"
                >
                    {taskOptions.length === 0
                        ? 'This batch has no tasks yet. Add tasks in Task Module › Task Management first.'
                        : 'Select a task or project to view and rate trainees in this batch.'}
                </div>
            )}

            {/* Step 3 + 4 — Trainees → Ratings */}
            {batchNo && taskName && (
                <>
                    <div
                        className="no-print mb-3 rounded-lg border border-neutral-200 bg-brand-50 px-4 py-3"
                        data-cy="task-rating-page-div-16"
                    >
                        <div
                            className="text-[11px] font-medium tracking-wide text-brand-600 uppercase"
                            data-cy="task-rating-page-div-rating-task"
                        >
                            Rating task
                        </div>
                        <div
                            className="text-lg font-semibold text-ink"
                            data-cy="task-rating-page-div-18"
                        >
                            {taskName}
                        </div>
                    </div>

                    <div
                        className="no-print hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block"
                        data-cy="task-rating-page-div-19"
                    >
                        <div
                            className="lss-scrollbar overflow-x-auto"
                            data-cy="task-rating-page-div-20"
                        >
                            <table
                                className="w-full min-w-[720px] border-collapse text-sm"
                                data-cy="task-rating-page-table-21"
                            >
                                <thead data-cy="task-rating-page-thead-22">
                                    <tr
                                        className="bg-neutral-50 text-left text-xs font-medium text-neutral-500"
                                        data-cy="task-rating-page-tr-23"
                                    >
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="task-rating-page-th-trainee"
                                        >
                                            Trainee
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="task-rating-page-th-rating"
                                        >
                                            Rating
                                        </th>
                                        <th
                                            className="px-4 py-2.5 font-medium"
                                            data-cy="task-rating-page-th-comments-optional"
                                        >
                                            Comments (optional)
                                        </th>
                                        <th
                                            className="px-4 py-2.5 text-right font-medium"
                                            data-cy="task-rating-page-th-actions"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody data-cy="task-rating-page-tbody-28">
                                    {batchTrainees.map((tr) => {
                                        const traineeId = String(tr.id);
                                        const existingApi = ratings.find(
                                            (r) => r.trainee_id === tr.id,
                                        );
                                        const existing = existingApi
                                            ? toTaskRating(existingApi)
                                            : undefined;
                                        const draft = draftFor(traineeId, existing);
                                        const name = personName(tr);
                                        return (
                                            <tr
                                                key={traineeId}
                                                className="border-t border-neutral-100 align-top"
                                                data-cy="task-rating-page-tr-29"
                                            >
                                                <td
                                                    className="px-4 py-3"
                                                    data-cy="task-rating-page-td-30"
                                                >
                                                    <div
                                                        className="font-medium text-ink"
                                                        data-cy="task-rating-page-div-31"
                                                    >
                                                        {name}
                                                    </div>
                                                </td>
                                                <td
                                                    className="px-4 py-3"
                                                    data-cy="task-rating-page-td-33"
                                                >
                                                    <RatingInput
                                                        value={draft.rating}
                                                        onChange={(v) =>
                                                            setDraft(
                                                                traineeId,
                                                                {
                                                                    rating: v,
                                                                },
                                                                existing,
                                                            )
                                                        }
                                                        data-cy="task-rating-page-rating-input-set-draft"
                                                    />
                                                    {existing && (
                                                        <div
                                                            className="mt-1 text-[11px] text-neutral-400"
                                                            data-cy="task-rating-page-div-last-saved"
                                                        >
                                                            Last saved{' '}
                                                            {existing.ratedAt}{' '}
                                                            by{' '}
                                                            {existing.evaluator}
                                                        </div>
                                                    )}
                                                </td>
                                                <td
                                                    className="px-4 py-3"
                                                    data-cy="task-rating-page-td-36"
                                                >
                                                    <textarea
                                                        rows={2}
                                                        value={draft.comments}
                                                        onChange={(e) =>
                                                            setDraft(
                                                                traineeId,
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
                                                        data-cy="task-rating-page-textarea-set-draft"
                                                    />
                                                </td>
                                                <td
                                                    className="px-4 py-3"
                                                    data-cy="task-rating-page-td-38"
                                                >
                                                    <div
                                                        className="flex flex-col items-end gap-1.5"
                                                        data-cy="task-rating-page-div-39"
                                                    >
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            onClick={() =>
                                                                saveRating(
                                                                    traineeId,
                                                                    name,
                                                                )
                                                            }
                                                            data-cy="task-rating-page-button-save-rating"
                                                        >
                                                            {existing
                                                                ? 'Update'
                                                                : 'Save'}
                                                        </Button>
                                                        {existingApi && (
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                icon={History}
                                                                onClick={() =>
                                                                    openHistory(
                                                                        existingApi,
                                                                    )
                                                                }
                                                                data-cy="task-rating-page-button-set-history-for"
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
                                        <tr data-cy="task-rating-page-tr-42">
                                            <td
                                                colSpan={4}
                                                className="px-4 py-10 text-center text-xs text-neutral-400"
                                                data-cy="task-rating-page-td-no-trainees-found-in-this-batch"
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
                    <div
                        className="no-print flex flex-col gap-3 sm:hidden"
                        data-cy="task-rating-page-div-44"
                    >
                        {batchTrainees.map((tr) => {
                            const traineeId = String(tr.id);
                            const existingApi = ratings.find(
                                (r) => r.trainee_id === tr.id,
                            );
                            const existing = existingApi
                                ? toTaskRating(existingApi)
                                : undefined;
                            const draft = draftFor(traineeId, existing);
                            const name = personName(tr);
                            return (
                                <div
                                    key={traineeId}
                                    className="rounded-lg border border-neutral-200 bg-white p-3.5"
                                    data-cy="task-rating-page-div-45"
                                >
                                    <div
                                        className="mb-2"
                                        data-cy="task-rating-page-div-46"
                                    >
                                        <div
                                            className="font-medium text-ink"
                                            data-cy="task-rating-page-div-47"
                                        >
                                            {name}
                                        </div>
                                    </div>
                                    <div
                                        className="mb-2"
                                        data-cy="task-rating-page-div-49"
                                    >
                                        <RatingInput
                                            value={draft.rating}
                                            onChange={(v) =>
                                                setDraft(
                                                    traineeId,
                                                    {
                                                        rating: v,
                                                    },
                                                    existing,
                                                )
                                            }
                                            data-cy="task-rating-page-rating-input-set-draft-2"
                                        />
                                        {existing && (
                                            <div
                                                className="mt-1 text-[11px] text-neutral-400"
                                                data-cy="task-rating-page-div-last-saved-2"
                                            >
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
                                                traineeId,
                                                {
                                                    comments: e.target.value,
                                                },
                                                existing,
                                            )
                                        }
                                        placeholder="Feedback for this trainee on this task..."
                                        className="mb-2.5 w-full resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-ink transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                        data-cy="task-rating-page-textarea-set-draft-2"
                                    />
                                    <div
                                        className="flex gap-2"
                                        data-cy="task-rating-page-div-53"
                                    >
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            className="flex-1"
                                            onClick={() =>
                                                saveRating(traineeId, name)
                                            }
                                            data-cy="task-rating-page-button-save-rating-2"
                                        >
                                            {existing ? 'Update' : 'Save'}
                                        </Button>
                                        {existingApi && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                icon={History}
                                                onClick={() =>
                                                    openHistory(existingApi)
                                                }
                                                data-cy="task-rating-page-button-set-history-for-2"
                                            >
                                                History
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        {batchTrainees.length === 0 && (
                            <div
                                className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-xs text-neutral-400"
                                data-cy="task-rating-page-div-no-trainees-found-in-this-batch"
                            >
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
                title={`Rating history – ${historyFor ? personName(historyFor.trainee) : ''}`}
                maxWidth={480}
                data-cy="task-rating-page-modal-set-history-for"
            >
                {historyFor && (
                    <div
                        className="flex flex-col gap-2.5"
                        data-cy="task-rating-page-div-58"
                    >
                        <p
                            className="mb-1 text-xs text-neutral-500"
                            data-cy="task-rating-page-p-59"
                        >
                            {historyFor.task_name} · {batchNo}
                        </p>
                        {history.map((h, i) => (
                            <div
                                key={i}
                                className="rounded-md border border-neutral-200 p-3"
                                data-cy="task-rating-page-div-60"
                            >
                                <div
                                    className="mb-1 flex items-center justify-between"
                                    data-cy="task-rating-page-div-61"
                                >
                                    <RatingInput
                                        value={h.rating}
                                        data-cy="task-rating-page-rating-input-62"
                                    />
                                    <span
                                        className="text-[11px] text-neutral-400"
                                        data-cy="task-rating-page-span-63"
                                    >
                                        {h.ratedAt}
                                    </span>
                                </div>
                                {h.comments && (
                                    <p
                                        className="text-xs text-neutral-600"
                                        data-cy="task-rating-page-p-64"
                                    >
                                        {h.comments}
                                    </p>
                                )}
                                <div
                                    className="mt-1 text-[11px] text-neutral-400"
                                    data-cy="task-rating-page-div-evaluated-by"
                                >
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
                    data-cy="task-rating-page-rating-sheet-print-66"
                />
            )}
        </div>
    );
}
