import { useMemo, useState } from 'react';
import { ClipboardCheck, History, Printer, ClipboardList } from 'lucide-react';
import { Dropdown } from '@/components/Dropdown';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { StatCard } from '@/components/StatCard';
import { RatingStars } from '@/components/RatingStars';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import {
    behavioralQuestions,
    behavioralRatingRecords as initialRatings,
    TODAY,
    currentUser,
} from '@/data/mockData';
import { useBatches } from '@/context/BatchesContext';
import type {
    BehavioralAnswer,
    BehavioralQuestion,
    BehavioralRating,
} from '@/types';
import { toDateInputValue } from '@/lib/utils';
import { BehavioralSheetPrint } from '@/pages/developer/ratings/BehavioralSheetPrint';

/** Overall average considers only the rated (1–5) statements, not written-response items. */
function averageOf(answers: BehavioralAnswer[]) {
    const scores = answers
        .filter((a) => a.score != null)
        .map((a) => a.score as number);
    if (!scores.length) return 0;
    return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

function groupBySection(questions: BehavioralQuestion[]) {
    const map = new Map<string, BehavioralQuestion[]>();
    questions.forEach((q) => {
        if (!map.has(q.section)) map.set(q.section, []);
        map.get(q.section)!.push(q);
    });
    return Array.from(map.entries());
}

export function BehavioralAssessmentForm() {
    const { batches, trainees } = useBatches();
    const { showToast } = useToast();
    const [ratings, setRatings] = useState<BehavioralRating[]>(initialRatings);
    const activeQuestions = useMemo(
        () =>
            behavioralQuestions
                .filter((q) => q.status === 'active')
                .sort((a, b) => a.order - b.order),
        [],
    );
    const sections = useMemo(
        () => groupBySection(activeQuestions),
        [activeQuestions],
    );

    const [batchNo, setBatchNo] = useState('');
    const batchTrainees = useMemo(
        () => trainees.filter((t) => t.batchNo === batchNo && !t.archived),
        [batchNo],
    );

    const [formFor, setFormFor] = useState<{
        traineeId: string;
        traineeName: string;
    } | null>(null);
    const [draftScores, setDraftScores] = useState<Record<string, number>>({});
    const [draftTexts, setDraftTexts] = useState<Record<string, string>>({});

    const [historyFor, setHistoryFor] = useState<BehavioralRating | null>(null);
    const [printFor, setPrintFor] = useState<BehavioralRating | null>(null);

    function ratingFor(traineeId: string) {
        return ratings.find(
            (r) => r.batchNo === batchNo && r.traineeId === traineeId,
        );
    }

    function openForm(traineeId: string, traineeName: string) {
        const existing = ratingFor(traineeId);
        const scores: Record<string, number> = {};
        const texts: Record<string, string> = {};
        activeQuestions.forEach((q) => {
            const answer = existing?.answers.find((a) => a.questionId === q.id);
            if (q.type === 'rating') scores[q.id] = answer?.score ?? 0;
            else texts[q.id] = answer?.text ?? '';
        });
        setDraftScores(scores);
        setDraftTexts(texts);
        setFormFor({ traineeId, traineeName });
    }

    function submitForm() {
        if (!formFor) return;
        const unansweredRatings = activeQuestions.filter(
            (q) => q.type === 'rating' && !draftScores[q.id],
        );
        const unansweredText = activeQuestions.filter(
            (q) => q.type === 'text' && !draftTexts[q.id]?.trim(),
        );
        if (unansweredRatings.length > 0) {
            showToast('Rate every statement before submitting.', 'error');
            return;
        }
        if (unansweredText.length > 0) {
            showToast(
                'Answer every written-feedback question before submitting.',
                'error',
            );
            return;
        }

        const answers: BehavioralAnswer[] = activeQuestions.map((q) =>
            q.type === 'rating'
                ? { questionId: q.id, score: draftScores[q.id] }
                : { questionId: q.id, text: draftTexts[q.id]?.trim() },
        );

        // Derived summary fields, kept for backward-compatible display on the trainee profile / print sheet.
        const overallComments =
            answers.find((a) => a.questionId === 'bq25')?.text ??
            answers.find((a) => a.questionId === 'bq22')?.text ??
            '';
        const recommendation =
            answers.find((a) => a.questionId === 'bq29')?.text ?? '';

        const ratedAt = toDateInputValue(TODAY);
        const historyEntry = {
            answers,
            overallComments,
            recommendation,
            evaluator: currentUser.name,
            ratedAt,
        };
        const existing = ratingFor(formFor.traineeId);

        setRatings((prev) => {
            if (existing) {
                return prev.map((r) =>
                    r.id === existing.id
                        ? {
                              ...r,
                              answers,
                              overallComments,
                              recommendation,
                              evaluator: currentUser.name,
                              ratedAt,
                              history: [...r.history, historyEntry],
                          }
                        : r,
                );
            }
            const created: BehavioralRating = {
                id: `br-${Date.now()}`,
                batchNo,
                traineeId: formFor.traineeId,
                traineeName: formFor.traineeName,
                answers,
                overallComments,
                recommendation,
                evaluator: currentUser.name,
                ratedAt,
                history: [historyEntry],
            };
            return [...prev, created];
        });
        showToast(
            existing
                ? `Evaluation updated for ${formFor.traineeName}.`
                : `Evaluation submitted for ${formFor.traineeName}.`,
            'success',
        );
        setFormFor(null);
    }

    function printRating(rating: BehavioralRating) {
        setPrintFor(rating);
        requestAnimationFrame(() => {
            window.print();
        });
    }

    return (
        <div>
            <div className="no-print mb-4">
                <p className="text-sm text-neutral-500">
                    Evaluate trainees using the Trainer Evaluation for Trainees
                    questionnaire.
                </p>
            </div>

            {/* Step 1 — Batch */}
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
                        onChange={(v) =>
                            setBatchNo(v === 'Select batch' ? '' : v)
                        }
                    />
                </div>
                {batchNo && (
                    <StatCard
                        label="Evaluated"
                        value={`${batchTrainees.filter((t) => ratingFor(t.id)).length} / ${batchTrainees.length}`}
                        tone="accent"
                        className="w-40"
                    />
                )}
            </div>

            {!batchNo && (
                <div className="no-print rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
                    <ClipboardList
                        size={22}
                        className="mx-auto mb-2 text-neutral-300"
                    />
                    Select a batch to view its trainees and open their
                    evaluation form.
                </div>
            )}

            {/* Step 2 — Trainees */}
            {batchNo && (
                <>
                    <div className="no-print hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block">
                        <div className="lss-scrollbar overflow-x-auto">
                            <table className="w-full min-w-[640px] border-collapse text-sm">
                                <thead>
                                    <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                                        <th className="px-4 py-2.5 font-medium">
                                            Trainee
                                        </th>
                                        <th className="px-4 py-2.5 font-medium">
                                            Status
                                        </th>
                                        <th className="px-4 py-2.5 font-medium">
                                            Overall score
                                        </th>
                                        <th className="px-4 py-2.5 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batchTrainees.map((tr) => {
                                        const existing = ratingFor(tr.id);
                                        const avg = existing
                                            ? averageOf(existing.answers)
                                            : 0;
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
                                                    {existing ? (
                                                        <StatusBadge status="completed" />
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
                                                            Not evaluated
                                                        </span>
                                                    )}
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
                                                    {existing ? (
                                                        <RatingStars
                                                            value={avg}
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-neutral-400">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                                                        <Button
                                                            size="sm"
                                                            variant="primary"
                                                            icon={
                                                                ClipboardCheck
                                                            }
                                                            onClick={() =>
                                                                openForm(
                                                                    tr.id,
                                                                    tr.name,
                                                                )
                                                            }
                                                        >
                                                            {existing
                                                                ? 'Edit form'
                                                                : 'Evaluate'}
                                                        </Button>
                                                        {existing && (
                                                            <>
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
                                                                <Button
                                                                    size="sm"
                                                                    variant="secondary"
                                                                    icon={
                                                                        Printer
                                                                    }
                                                                    onClick={() =>
                                                                        printRating(
                                                                            existing,
                                                                        )
                                                                    }
                                                                >
                                                                    Print
                                                                </Button>
                                                            </>
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

                    {/* Mobile cards */}
                    <div className="no-print flex flex-col gap-2 sm:hidden">
                        {batchTrainees.map((tr) => {
                            const existing = ratingFor(tr.id);
                            const avg = existing
                                ? averageOf(existing.answers)
                                : 0;
                            return (
                                <div
                                    key={tr.id}
                                    className="rounded-lg border border-neutral-200 bg-white p-3.5"
                                >
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <div>
                                            <div className="font-medium text-ink">
                                                {tr.name}
                                            </div>
                                            <div className="text-xs text-neutral-400">
                                                {tr.school}
                                            </div>
                                        </div>
                                        {existing ? (
                                            <StatusBadge status="completed" />
                                        ) : (
                                            <span className="inline-flex items-center rounded-pill bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-500">
                                                Not evaluated
                                            </span>
                                        )}
                                    </div>
                                    {existing && <RatingStars value={avg} />}
                                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-neutral-100 pt-2.5">
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            icon={ClipboardCheck}
                                            onClick={() =>
                                                openForm(tr.id, tr.name)
                                            }
                                        >
                                            {existing
                                                ? 'Edit form'
                                                : 'Evaluate'}
                                        </Button>
                                        {existing && (
                                            <>
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
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    icon={Printer}
                                                    onClick={() =>
                                                        printRating(existing)
                                                    }
                                                >
                                                    Print
                                                </Button>
                                            </>
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

            {/* Evaluation form modal */}
            <Modal
                open={!!formFor}
                onClose={() => setFormFor(null)}
                title={`Trainer evaluation \u2013 ${formFor?.traineeName ?? ''}`}
                description={batchNo}
                maxWidth={640}
            >
                {formFor && (
                    <>
                        <div className="mb-5 flex flex-col gap-5">
                            {sections.map(([section, qs]) => (
                                <div key={section}>
                                    <div className="mb-2 text-xs font-semibold tracking-wide text-brand-600 uppercase">
                                        {section}
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        {qs.map((q, i) => (
                                            <div key={q.id}>
                                                {q.type === 'rating' ? (
                                                    <div className="flex items-center justify-between gap-3 rounded-md border border-neutral-200 p-3">
                                                        <span className="text-sm text-ink">
                                                            <span className="mr-1.5 text-neutral-400">
                                                                {i + 1}.
                                                            </span>
                                                            {q.question}
                                                        </span>
                                                        <RatingStars
                                                            value={
                                                                draftScores[
                                                                    q.id
                                                                ] ?? 0
                                                            }
                                                            onChange={(v) =>
                                                                setDraftScores(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [q.id]: v,
                                                                    }),
                                                                )
                                                            }
                                                            size={18}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="rounded-md border border-neutral-200 p-3">
                                                        <label className="mb-1.5 block text-sm text-ink">
                                                            <span className="mr-1.5 text-neutral-400">
                                                                {i + 1}.
                                                            </span>
                                                            {q.question}
                                                        </label>
                                                        <textarea
                                                            rows={2}
                                                            value={
                                                                draftTexts[
                                                                    q.id
                                                                ] ?? ''
                                                            }
                                                            onChange={(e) =>
                                                                setDraftTexts(
                                                                    (prev) => ({
                                                                        ...prev,
                                                                        [q.id]: e
                                                                            .target
                                                                            .value,
                                                                    }),
                                                                )
                                                            }
                                                            placeholder="Write your response..."
                                                            className="w-full resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-ink transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {activeQuestions.length === 0 && (
                                <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                                    No active questions yet. Add questions in
                                    the Question Setup tab first.
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setFormFor(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={submitForm}
                                disabled={activeQuestions.length === 0}
                            >
                                {ratingFor(formFor.traineeId)
                                    ? 'Save changes'
                                    : 'Submit evaluation'}
                            </Button>
                        </div>
                    </>
                )}
            </Modal>

            {/* History modal */}
            <Modal
                open={!!historyFor}
                onClose={() => setHistoryFor(null)}
                title={`Evaluation history \u2013 ${historyFor?.traineeName ?? ''}`}
                maxWidth={520}
            >
                {historyFor && (
                    <div className="flex flex-col gap-2.5">
                        <p className="mb-1 text-xs text-neutral-500">
                            {historyFor.batchNo}
                        </p>
                        {[...historyFor.history].reverse().map((h, i) => (
                            <div
                                key={i}
                                className="rounded-md border border-neutral-200 p-3"
                            >
                                <div className="mb-1 flex items-center justify-between">
                                    <RatingStars value={averageOf(h.answers)} />
                                    <span className="text-[11px] text-neutral-400">
                                        {h.ratedAt}
                                    </span>
                                </div>
                                {h.overallComments && (
                                    <p className="text-xs text-neutral-600">
                                        {h.overallComments}
                                    </p>
                                )}
                                {h.recommendation && (
                                    <p className="mt-1 text-xs text-neutral-500 italic">
                                        Recommendation: {h.recommendation}
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
            {printFor && (
                <BehavioralSheetPrint
                    batchNo={printFor.batchNo}
                    rating={printFor}
                    questions={behavioralQuestions.filter((q) =>
                        printFor.answers.some((a) => a.questionId === q.id),
                    )}
                    average={averageOf(printFor.answers)}
                    generatedAt={new Date().toLocaleString('en-PH', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                    })}
                />
            )}
        </div>
    );
}
