import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { RatingStars } from '@/components/RatingStars';
import { useToast } from '@/components/Toast';
import TraineeLayout from '@/layouts/trainee/TraineeLayout';
import { traineeEvaluationsService } from '@/api-service-layer/trainee/evaluations';
import type {
    EvaluationTrainerOption,
    TrainerEvaluationGateway,
    TrainerEvaluationQuestion,
} from '@/types/modules/evaluation/trainer-evaluation';

function groupBySection(questions: TrainerEvaluationQuestion[]) {
    const map = new Map<string, TrainerEvaluationQuestion[]>();
    questions.forEach((q) => {
        if (!map.has(q.section)) map.set(q.section, []);
        map.get(q.section)!.push(q);
    });
    return Array.from(map.entries());
}

export default function TraineeEvaluationPage() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState(false);
    const [gateway, setGateway] = useState<TrainerEvaluationGateway | null>(null);
    const [questions, setQuestions] = useState<TrainerEvaluationQuestion[]>([]);
    const sections = useMemo(() => groupBySection(questions), [questions]);

    function reload() {
        setLoading(true);
        setLoadError(false);
        Promise.all([
            traineeEvaluationsService.gateway(),
            traineeEvaluationsService.activeQuestions(),
        ])
            .then(([gatewayRes, questionsRes]) => {
                setGateway(gatewayRes);
                setQuestions(questionsRes);
            })
            .catch(() => {
                setLoadError(true);
                showToast('Failed to load evaluation form.', 'error');
            })
            .finally(() => setLoading(false));
    }

    useEffect(reload, []);

    const [formFor, setFormFor] = useState<EvaluationTrainerOption | null>(null);
    const [draftScores, setDraftScores] = useState<Record<string, number>>({});
    const [draftTexts, setDraftTexts] = useState<Record<string, string>>({});
    const [draftRemarks, setDraftRemarks] = useState('');
    const [saving, setSaving] = useState(false);

    function openForm(trainer: EvaluationTrainerOption) {
        setDraftScores({});
        setDraftTexts({});
        setDraftRemarks('');
        setFormFor(trainer);
    }

    async function submit() {
        if (!formFor) return;
        const unansweredRatings = questions.filter(
            (q) => q.type === 'rating' && !draftScores[q.id],
        );
        const unansweredText = questions.filter(
            (q) => q.type === 'text' && !draftTexts[q.id]?.trim(),
        );
        if (unansweredRatings.length > 0 || unansweredText.length > 0) {
            showToast('Answer every question before submitting.', 'error');
            return;
        }
        setSaving(true);
        try {
            await traineeEvaluationsService.submit({
                trainer_id: formFor.id,
                remarks: draftRemarks.trim() || null,
                answers: questions.map((q) =>
                    q.type === 'rating'
                        ? { question_id: q.id, score: draftScores[q.id] }
                        : { question_id: q.id, text_answer: draftTexts[q.id]?.trim() },
                ),
            });
            showToast(`Evaluation submitted for ${formFor.name}.`, 'success');
            setFormFor(null);
            reload();
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : 'Failed to submit evaluation.',
                'error',
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <TraineeLayout
            title="Trainer Evaluation"
            description="Evaluate the trainer(s) who supervised you during your program."
        >
            {loading && (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
                    Loading...
                </div>
            )}

            {!loading && loadError && (
                <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
                    Unable to load your evaluation status right now. Please
                    try again later.
                </div>
            )}

            {!loading && gateway && !gateway.eligible && (
                <div className="rounded-lg border border-warning-200 bg-warning-50 p-5">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-warning-700">
                        <AlertTriangle size={16} />
                        Not yet available
                    </div>
                    <p className="mb-3 text-sm text-neutral-600">
                        You'll be able to submit your trainer evaluation once
                        the following are complete:
                    </p>
                    <ul className="list-inside list-disc text-sm text-neutral-600">
                        {gateway.reasons.map((reason, i) => (
                            <li key={i}>{reason}</li>
                        ))}
                    </ul>
                </div>
            )}

            {!loading && gateway && gateway.eligible && (
                <div className="flex flex-col gap-3">
                    {gateway.trainers.length === 0 && (
                        <div className="rounded-lg border border-dashed border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
                            No trainers are currently assigned to your batch.
                        </div>
                    )}
                    {gateway.trainers.map((trainer) => (
                        <div
                            key={trainer.id}
                            className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4"
                        >
                            <div className="flex items-center gap-2.5">
                                {trainer.submitted ? (
                                    <CheckCircle2 size={18} className="text-success-600" />
                                ) : (
                                    <ClipboardCheck size={18} className="text-neutral-400" />
                                )}
                                <span className="text-sm font-medium text-ink">
                                    {trainer.name}
                                </span>
                            </div>
                            {trainer.submitted ? (
                                <span className="text-xs text-neutral-400">
                                    Evaluation submitted
                                </span>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="primary"
                                    icon={ClipboardCheck}
                                    onClick={() => openForm(trainer)}
                                >
                                    Evaluate
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={!!formFor}
                onClose={() => setFormFor(null)}
                title={`Trainer evaluation – ${formFor?.name ?? ''}`}
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
                                                            value={draftScores[q.id] ?? 0}
                                                            onChange={(v) =>
                                                                setDraftScores((prev) => ({
                                                                    ...prev,
                                                                    [q.id]: v,
                                                                }))
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
                                                            value={draftTexts[q.id] ?? ''}
                                                            onChange={(e) =>
                                                                setDraftTexts((prev) => ({
                                                                    ...prev,
                                                                    [q.id]: e.target.value,
                                                                }))
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
                                    No active questions yet. Please check
                                    back later.
                                </div>
                            )}

                            <div>
                                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-neutral-500 uppercase">
                                    Additional comments
                                </label>
                                <textarea
                                    rows={3}
                                    value={draftRemarks}
                                    onChange={(e) => setDraftRemarks(e.target.value)}
                                    placeholder="Optional comments about this trainer..."
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
                                onClick={submit}
                                disabled={questions.length === 0 || saving}
                            >
                                Submit Evaluation
                            </Button>
                        </div>
                    </>
                )}
            </Modal>
        </TraineeLayout>
    );
}
