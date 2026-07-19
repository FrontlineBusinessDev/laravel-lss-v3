import { behavioralEvaluationsService } from '@/api-service-layer/admin/behavioral-ratings';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { RatingStars } from '@/components/RatingStars';
import { StatCard } from '@/components/StatCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/Toast';
import { AsyncSelectField } from '@/hooks/use-async-select-field';
import { apiFetchJson } from '@/lib/apiFetch';
import {
    BehavioralEvaluation,
    BehavioralEvaluationTrainee,
    BehavioralQuestion,
} from '@/types/modules/ratings/behavioral';
import { FieldOption } from '@/types/reusable/fields';
import { ClipboardCheck, ClipboardList, Printer } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BehavioralSheetPrint } from '../BehavrialSheetPrint';
import RatingsPrimaryLayout from '@/layouts/ratings/RatingsPrimaryLayout';

interface BatchOption {
    id: number;
    batch_code: string;
}

function traineeName(tr: BehavioralEvaluationTrainee): string {
    return `${tr.first_name} ${tr.last_name}`.trim();
}

/** Overall average considers only rated (1–5) statements, not written-response items. */
function averageOf(
    questions: BehavioralQuestion[],
    scores: Record<string, number>,
): number {
    const values = questions
        .filter((q) => q.type === 'rating')
        .map((q) => scores[q.id])
        .filter((v): v is number => !!v);
    if (!values.length) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function groupBySection(questions: BehavioralQuestion[]) {
    const map = new Map<string, BehavioralQuestion[]>();
    questions.forEach((q) => {
        if (!map.has(q.section)) map.set(q.section, []);
        map.get(q.section)!.push(q);
    });
    return Array.from(map.entries());
}

interface BehavioralAssessmentFormProps {
    batchLookupUrl?: string;
}

export default function index({
    batchLookupUrl = '/batches/lookup',
}: BehavioralAssessmentFormProps) {
    const { showToast } = useToast();
    const [questions, setQuestions] = useState<BehavioralQuestion[]>([]);
    const sections = useMemo(() => groupBySection(questions), [questions]);

    const [batchId, setBatchId] = useState('');
    const [batchesCache, setBatchesCache] = useState<BatchOption[]>([]);
    const [batchTrainees, setBatchTrainees] = useState<
        BehavioralEvaluationTrainee[]
    >([]);
    const [evaluations, setEvaluations] = useState<
        Record<string, BehavioralEvaluation>
    >({});

    useEffect(() => {
        behavioralEvaluationsService
            .activeQuestions()
            .then(setQuestions)
            .catch(() => showToast('Failed to load questions.', 'error'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadBatchOptions = useCallback(
        async (q: string): Promise<FieldOption[]> => {
            const res = await apiFetchJson<BatchOption[]>(
                `${batchLookupUrl}?status=active&q=${encodeURIComponent(q)}&per_page=50`,
            );
            const data = res.data ?? [];
            setBatchesCache((prev) => {
                const merged = [...prev];
                data.forEach((b) => {
                    if (!merged.some((m) => m.id === b.id)) merged.push(b);
                });
                return merged;
            });
            return data.map((b) => ({
                value: String(b.id),
                label: b.batch_code,
            }));
        },
        [batchLookupUrl],
    );
    const getBatchLabel = useCallback(
        (v: unknown) =>
            batchesCache.find((b) => String(b.id) === String(v))?.batch_code ??
            '',
        [batchesCache],
    );
    const batchLabel = getBatchLabel(batchId);

    useEffect(() => {
        if (!batchId) {
            setBatchTrainees([]);
            setEvaluations({});
            return;
        }
        behavioralEvaluationsService
            .trainees(batchId)
            .then((trainees) => {
                setBatchTrainees(trainees);
                return Promise.all(
                    trainees.map((tr) =>
                        behavioralEvaluationsService
                            .forTrainee(batchId, tr.id)
                            .then((evaluation) => [tr.id, evaluation] as const),
                    ),
                );
            })
            .then((pairs) => {
                const map: Record<string, BehavioralEvaluation> = {};
                pairs.forEach(([id, evaluation]) => {
                    if (evaluation) map[String(id)] = evaluation;
                });
                setEvaluations(map);
            })
            .catch(() => showToast('Failed to load trainees.', 'error'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [batchId]);

    const [formFor, setFormFor] = useState<{
        traineeId: string;
        traineeName: string;
    } | null>(null);
    const [draftScores, setDraftScores] = useState<Record<string, number>>({});
    const [draftTexts, setDraftTexts] = useState<Record<string, string>>({});
    const [draftRemarks, setDraftRemarks] = useState('');
    const [saving, setSaving] = useState(false);
    const [printFor, setPrintFor] = useState<{
        trainee: string;
        evaluation: BehavioralEvaluation;
    } | null>(null);

    function openForm(tr: BehavioralEvaluationTrainee) {
        const traineeId = String(tr.id);
        const existing = evaluations[traineeId];
        const scores: Record<string, number> = {};
        const texts: Record<string, string> = {};
        questions.forEach((q) => {
            const answer = existing?.answers.find(
                (a) => a.question_id === q.id,
            );
            if (q.type === 'rating') scores[q.id] = answer?.score ?? 0;
            else texts[q.id] = answer?.text_answer ?? '';
        });
        setDraftScores(scores);
        setDraftTexts(texts);
        setDraftRemarks(existing?.remarks ?? '');
        setFormFor({ traineeId, traineeName: traineeName(tr) });
    }

    async function submitForm() {
        if (!formFor) return;
        const unansweredRatings = questions.filter(
            (q) => q.type === 'rating' && !draftScores[q.id],
        );
        const unansweredText = questions.filter(
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
        setSaving(true);
        try {
            const evaluation = await behavioralEvaluationsService.submit({
                batch_id: Number(batchId),
                trainee_id: Number(formFor.traineeId),
                remarks: draftRemarks.trim() || null,
                answers: questions.map((q) =>
                    q.type === 'rating'
                        ? { question_id: q.id, score: draftScores[q.id] }
                        : {
                              question_id: q.id,
                              text_answer: draftTexts[q.id]?.trim(),
                          },
                ),
            });
            setEvaluations((prev) => ({
                ...prev,
                [formFor.traineeId]: evaluation,
            }));
            showToast(
                evaluations[formFor.traineeId]
                    ? `Evaluation updated for ${formFor.traineeName}.`
                    : `Evaluation submitted for ${formFor.traineeName}.`,
                'success',
            );
            setFormFor(null);
        } catch {
            showToast('Failed to save evaluation.', 'error');
        } finally {
            setSaving(false);
        }
    }

    function printEvaluation(traineeId: string, name: string) {
        const evaluation = evaluations[traineeId];
        if (!evaluation) return;
        setPrintFor({ trainee: name, evaluation });
        requestAnimationFrame(() => window.print());
    }
    return (
        <>
        <RatingsPrimaryLayout>
            <div>
                {/* <div className="no-print mb-4">
                    <p className="text-sm text-neutral-500">
                        Evaluate trainees using the Trainer Evaluation for
                        Trainees questionnaire.
                    </p>
                </div> */}

                {/* Step 1 — Batch */}
                <div className="no-print mb-4 flex flex-wrap items-end gap-3 rounded-lg border border-neutral-200 bg-white p-3.5">
                    <div className="w-56">
                        <label className="mb-1 block text-[11px] font-medium text-neutral-500">
                            1. Batch
                        </label>
                        <AsyncSelectField
                            value={batchId}
                            placeholder="Select batch"
                            loadOptions={loadBatchOptions}
                            getOptionLabel={getBatchLabel}
                            onChange={(v) => setBatchId((v as string) ?? '')}
                        />
                    </div>
                    {batchLabel && (
                        <StatCard
                            label="Evaluated"
                            value={`${batchTrainees.filter((t) => evaluations[String(t.id)]).length} / ${batchTrainees.length}`}
                            tone="accent"
                            className="w-40"
                        />
                    )}
                </div>

                {!batchLabel && (
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
                {batchLabel && (
                    <div className="no-print overflow-hidden rounded-lg border border-neutral-200 bg-white">
                        <div className="lss-scrollbar overflow-x-auto">
                            <table className="w-full min-w-160 border-collapse text-sm">
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
                                        const traineeId = String(tr.id);
                                        const existing = evaluations[traineeId];
                                        const avg = existing
                                            ? averageOf(
                                                  questions,
                                                  Object.fromEntries(
                                                      existing.answers.map(
                                                          (a) => [
                                                              a.question_id,
                                                              a.score ?? 0,
                                                          ],
                                                      ),
                                                  ),
                                              )
                                            : 0;
                                        return (
                                            <tr
                                                key={traineeId}
                                                className="border-t border-neutral-100 align-top"
                                            >
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-ink">
                                                        {traineeName(tr)}
                                                    </div>
                                                    <div className="text-xs text-neutral-400">
                                                        {tr.school
                                                            ?.school_name ??
                                                            '—'}
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
                                                                openForm(tr)
                                                            }
                                                        >
                                                            {existing
                                                                ? 'Edit form'
                                                                : 'Evaluate'}
                                                        </Button>
                                                        {existing && (
                                                            <Button
                                                                size="sm"
                                                                variant="secondary"
                                                                icon={Printer}
                                                                onClick={() =>
                                                                    printEvaluation(
                                                                        traineeId,
                                                                        traineeName(
                                                                            tr,
                                                                        ),
                                                                    )
                                                                }
                                                            >
                                                                Print
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
                )}

                {/* Evaluation form modal */}
                <Modal
                    open={!!formFor}
                    onClose={() => setFormFor(null)}
                    title={`Trainer evaluation – ${formFor?.traineeName ?? ''}`}
                    description={batchLabel}
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
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [q.id]:
                                                                                v,
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
                                                                        (
                                                                            prev,
                                                                        ) => ({
                                                                            ...prev,
                                                                            [q.id]:
                                                                                e
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
                                {questions.length === 0 && (
                                    <div className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-sm text-neutral-500">
                                        No active questions yet. Add questions
                                        in the Behavioral Setup tab first.
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                        Evaluator Comments &amp; Recommendations
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={draftRemarks}
                                        onChange={(e) =>
                                            setDraftRemarks(e.target.value)
                                        }
                                        placeholder="Overall comments and recommendations for this trainee..."
                                        className="w-full resize-none rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm text-ink transition-colors placeholder:text-neutral-400 hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setFormFor(null)}
                                    disabled={saving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    className="flex-1"
                                    onClick={submitForm}
                                    disabled={questions.length === 0 || saving}
                                >
                                    {evaluations[formFor.traineeId]
                                        ? 'Save changes'
                                        : 'Submit evaluation'}
                                </Button>
                            </div>
                        </>
                    )}
                </Modal>

                {/* Print layout */}
                {printFor && (
                    <BehavioralSheetPrint
                        batchNo={batchLabel}
                        traineeName={printFor.trainee}
                        evaluation={printFor.evaluation}
                        questions={questions.filter((q) =>
                            printFor.evaluation.answers.some(
                                (a) => a.question_id === q.id,
                            ),
                        )}
                        average={averageOf(
                            questions,
                            Object.fromEntries(
                                printFor.evaluation.answers.map((a) => [
                                    a.question_id,
                                    a.score ?? 0,
                                ]),
                            ),
                        )}
                        generatedAt={new Date().toLocaleString('en-PH', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                        })}
                    />
                )}
            </div>
        </>
    );
}
