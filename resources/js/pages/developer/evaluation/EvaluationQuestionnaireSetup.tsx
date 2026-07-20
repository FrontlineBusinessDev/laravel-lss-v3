import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderPlus, Pencil, Plus, Search, Archive, Trash2 } from 'lucide-react';
import {
    evaluationQuestionCategoriesService,
    evaluationSeminarQuestionsService,
    evaluationTrainerQuestionsService,
} from '@/api-service-layer/admin/evaluation';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import type {
    EvaluationSeminarQuestion,
    EvaluationTrainerCategories,
    EvaluationTrainerQuestion,
} from '@/types/modules/evaluation/evaluation';
import EvaluationQuestionModal, { TYPE_LABEL } from './EvaluationQuestionModal';

type Question = EvaluationTrainerQuestion | EvaluationSeminarQuestion;

interface Props {
    category: 'Trainer' | 'Seminar';
}

function groupBySection(questions: Question[]) {
    const map = new Map<string, Question[]>();
    questions.forEach((q) => {
        if (!map.has(q.section)) map.set(q.section, []);
        map.get(q.section)!.push(q);
    });
    return Array.from(map.entries());
}

/**
 * Question-bank grid shared by the Trainer and Seminar Questionnaire tabs:
 * a category-pill row (Academic Industry for Trainer, free-text set for
 * Seminar) + a section-grouped question list scoped to the selected
 * category. Mirrors the reference mockups — replaces the previous flat
 * DataTableCardField table.
 */
export function EvaluationQuestionnaireSetup({ category }: Props) {
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const isTrainer = category === 'Trainer';

    const [selected, setSelected] = useState<number | string | null>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [addSetOpen, setAddSetOpen] = useState(false);
    const [newSetValue, setNewSetValue] = useState('');
    const [editRow, setEditRow] = useState<Question | null>(null);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);

    const categoriesQuery = useQuery<EvaluationTrainerCategories | string[]>({
        queryKey: ['evaluation-question-categories', category],
        queryFn: () =>
            isTrainer
                ? evaluationQuestionCategoriesService.trainerCategories()
                : evaluationQuestionCategoriesService.seminarCategories(),
    });

    const pills: Array<{ value: number | string; label: string }> = isTrainer
        ? ((categoriesQuery.data as EvaluationTrainerCategories | undefined)?.in_use ?? [])
              .map((c) => ({ value: c.id, label: c.name }))
        : ((categoriesQuery.data as string[] | undefined) ?? []).map((c) => ({
              value: c,
              label: c,
          }));

    const availableIndustries = isTrainer
        ? ((categoriesQuery.data as EvaluationTrainerCategories | undefined)?.available ?? [])
        : [];

    useEffect(() => {
        if (selected === null && pills.length > 0) {
            setSelected(pills[0].value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pills.length]);

    const questionsQuery = useQuery<Question[]>({
        queryKey: ['evaluation-questions-for-category', category, selected, search, status],
        queryFn: async (): Promise<Question[]> =>
            isTrainer
                ? await evaluationQuestionCategoriesService.trainerForCategory({
                      academic_industry_id: Number(selected),
                      search: search || undefined,
                      status: status || undefined,
                  })
                : await evaluationQuestionCategoriesService.seminarForCategory({
                      category: String(selected),
                      search: search || undefined,
                      status: status || undefined,
                  }),
        enabled: selected !== null,
    });

    const questions = questionsQuery.data ?? [];
    const sections = useMemo(() => groupBySection(questions), [questions]);
    const activeCount = questions.filter((q) => q.status === 'active').length;

    const service = isTrainer
        ? evaluationTrainerQuestionsService
        : evaluationSeminarQuestionsService;

    function invalidateQuestions() {
        queryClient.invalidateQueries({ queryKey: ['evaluation-questions-for-category'] });
        queryClient.invalidateQueries({ queryKey: ['evaluation-question-categories'] });
    }

    async function archive(q: Question) {
        setBusyId(q.id);
        try {
            await service.archive(q.id);
            showToast('Question archived.', 'success');
            invalidateQuestions();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to archive.', 'error');
        } finally {
            setBusyId(null);
        }
    }

    async function remove(q: Question) {
        if (!window.confirm('Delete this question? This cannot be undone.')) return;
        setBusyId(q.id);
        try {
            await service.delete(q.id);
            showToast('Question deleted.', 'success');
            invalidateQuestions();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete.', 'error');
        } finally {
            setBusyId(null);
        }
    }

    function openAddSet() {
        setNewSetValue('');
        setAddSetOpen(true);
    }

    function confirmAddSet(value: number | string) {
        setSelected(value);
        setAddSetOpen(false);
        setEditRow(null);
        setQuestionModalOpen(true);
    }

    return (
        <div>
            <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                    <h2 className="text-sm font-semibold text-ink">
                        {isTrainer ? 'Trainer evaluation questions' : 'Seminar evaluation questions'}
                    </h2>
                    <p className="text-xs text-neutral-500">
                        {activeCount} active of {questions.length} total
                        {pills.find((p) => p.value === selected)
                            ? ` in "${pills.find((p) => p.value === selected)?.label}"`
                            : ''}{' '}
                        &middot; used by {isTrainer ? 'trainees to assess trainers' : 'participants to assess resource speakers'}
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={Plus}
                    disabled={selected === null}
                    onClick={() => {
                        setEditRow(null);
                        setQuestionModalOpen(true);
                    }}
                >
                    Add question
                </Button>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
                {pills.map((pill) => (
                    <button
                        key={String(pill.value)}
                        type="button"
                        onClick={() => setSelected(pill.value)}
                        className={
                            'rounded-pill px-3 py-1.5 text-xs font-medium transition-colors ' +
                            (selected === pill.value
                                ? 'bg-brand-500 text-white'
                                : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50')
                        }
                    >
                        {pill.label}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={openAddSet}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50"
                >
                    <FolderPlus size={13} />
                    Add set
                </button>
            </div>

            <div className="mb-3 flex items-center gap-2">
                <div className="relative flex-1">
                    <Search
                        size={14}
                        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search questions or author..."
                        className="h-9 w-full rounded-md border border-neutral-200 pr-2.5 pl-8 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                    />
                </div>
                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-9 rounded-md border border-neutral-200 px-2.5 text-sm text-neutral-600"
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Archived</option>
                </select>
                <span className="shrink-0 text-xs text-neutral-500">
                    {questions.length} of {questions.length}
                </span>
            </div>

            {selected === null && (
                <div className="rounded-md border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                    Add a set to start building this questionnaire.
                </div>
            )}

            {selected !== null && sections.length === 0 && !questionsQuery.isLoading && (
                <div className="rounded-md border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                    No questions yet in this set.
                </div>
            )}

            <div className="flex flex-col gap-4">
                {sections.map(([section, qs]) => (
                    <div key={section}>
                        <div className="mb-2 text-xs font-semibold tracking-wide text-neutral-400 uppercase">
                            {section}
                        </div>
                        <div className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
                            {qs.map((q) => (
                                <div
                                    key={q.id}
                                    className="flex items-start justify-between gap-3 px-4 py-3"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-sm text-ink">{q.question}</span>
                                            <span className="rounded-pill bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                                                {TYPE_LABEL[q.type]}
                                            </span>
                                            {q.is_critical && (
                                                <span className="rounded-pill bg-warning-50 px-1.5 py-0.5 text-[10px] font-medium text-warning-700">
                                                    Critical
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-xs text-neutral-500">
                                            Added by{' '}
                                            {q.creator
                                                ? `${q.creator.first_name} ${q.creator.last_name}`
                                                : 'Unknown'}{' '}
                                            &middot; {new Date(q.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditRow(q);
                                                setQuestionModalOpen(true);
                                            }}
                                            title="Edit"
                                            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => archive(q)}
                                            disabled={busyId === q.id}
                                            title="Archive"
                                            className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100"
                                        >
                                            <Archive size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => remove(q)}
                                            disabled={busyId === q.id}
                                            title="Delete"
                                            className="rounded-md p-1.5 text-danger-600 hover:bg-danger-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <EvaluationQuestionModal
                category={category}
                categoryValue={
                    editRow
                        ? isTrainer
                            ? (editRow as EvaluationTrainerQuestion).academic_industry_id
                            : (editRow as EvaluationSeminarQuestion).category
                        : selected
                }
                open={questionModalOpen}
                onClose={() => {
                    setQuestionModalOpen(false);
                    invalidateQuestions();
                }}
                row={editRow}
            />

            <Modal
                open={addSetOpen}
                onClose={() => setAddSetOpen(false)}
                title="Add set"
                maxWidth={420}
            >
                {isTrainer ? (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-neutral-500">
                            Pick the Academic Industry this new question set belongs to.
                        </p>
                        <div className="flex flex-col gap-1.5">
                            {availableIndustries
                                .filter((ind) => !pills.some((p) => p.value === ind.id))
                                .map((ind) => (
                                    <button
                                        key={ind.id}
                                        type="button"
                                        onClick={() => confirmAddSet(ind.id)}
                                        className="rounded-md border border-neutral-200 px-3 py-2 text-left text-sm text-ink hover:bg-neutral-50"
                                    >
                                        {ind.name}
                                    </button>
                                ))}
                            {availableIndustries.filter((ind) => !pills.some((p) => p.value === ind.id))
                                .length === 0 && (
                                <p className="text-xs text-neutral-400">
                                    Every active Academic Industry already has a set.
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <p className="text-sm text-neutral-500">
                            Name the new seminar-type question set (e.g. "Compliance & Softskills Seminars").
                        </p>
                        <input
                            type="text"
                            value={newSetValue}
                            onChange={(e) => setNewSetValue(e.target.value)}
                            placeholder="Set name"
                            className="h-9 rounded-md border border-neutral-200 px-2.5 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                        />
                        <Button
                            variant="primary"
                            disabled={!newSetValue.trim()}
                            onClick={() => confirmAddSet(newSetValue.trim())}
                        >
                            Continue
                        </Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
