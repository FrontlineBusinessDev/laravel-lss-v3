import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderPlus, Plus, Search } from 'lucide-react';
import { behavioralQuestionsService } from '@/api-service-layer/admin/behavioral-ratings';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useToast } from '@/components/Toast';
import type { BehavioralQuestion } from '@/types/modules/ratings/behavioral';
import BehavioralQuestionModal from './BehavioralQuestionModal';
import { BehavioralQuestionRow } from './BehavioralQuestionRow';

/**
 * Question-bank grid for the Behavioral Setup tab: a section-pill row +
 * a question list scoped to the selected section. Mirrors
 * EvaluationQuestionnaireSetup's Seminar variant (free-text section set,
 * grouped list, same row actions) — replaces the previous flat
 * DataTableCardField table with hardcoded sections.
 */
export function BehavioralAssessmentSetup() {
    const { showToast } = useToast();
    const queryClient = useQueryClient();

    const [selected, setSelected] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [addSetOpen, setAddSetOpen] = useState(false);
    const [newSetValue, setNewSetValue] = useState('');
    const [editRow, setEditRow] = useState<BehavioralQuestion | null>(null);
    const [questionModalOpen, setQuestionModalOpen] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);

    const sectionsQuery = useQuery<string[]>({
        queryKey: ['behavioral-question-sections'],
        queryFn: () => behavioralQuestionsService.sections(),
    });

    const pills = sectionsQuery.data ?? [];

    useEffect(() => {
        if (selected === null && pills.length > 0) {
            setSelected(pills[0]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pills.length]);

    const questionsQuery = useQuery<BehavioralQuestion[]>({
        queryKey: ['behavioral-questions-for-section', selected, search, status],
        queryFn: () =>
            behavioralQuestionsService.forSection({
                section: String(selected),
                search: search || undefined,
                status: status || undefined,
            }),
        enabled: selected !== null,
    });

    const [localQuestions, setLocalQuestions] = useState<BehavioralQuestion[]>([]);
    const [dragId, setDragId] = useState<number | null>(null);

    useEffect(() => {
        setLocalQuestions(questionsQuery.data ?? []);
    }, [questionsQuery.data]);

    const questions = localQuestions;
    const activeCount = questions.filter((q) => q.status === 'active').length;
    // Reordering only makes sense against the section's true, full order —
    // disabled while a search or status filter narrows what's on screen.
    const canReorder = selected !== null && search === '' && status === '';

    function invalidateQuestions() {
        queryClient.invalidateQueries({ queryKey: ['behavioral-questions-for-section'] });
        queryClient.invalidateQueries({ queryKey: ['behavioral-question-sections'] });
    }

    async function archive(q: BehavioralQuestion) {
        setBusyId(q.id);
        try {
            await behavioralQuestionsService.archive(q.id);
            showToast('Question archived.', 'success');
            invalidateQuestions();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to archive.', 'error');
        } finally {
            setBusyId(null);
        }
    }

    async function restore(q: BehavioralQuestion) {
        setBusyId(q.id);
        try {
            await behavioralQuestionsService.restore(q.id);
            showToast('Question restored.', 'success');
            invalidateQuestions();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to restore.', 'error');
        } finally {
            setBusyId(null);
        }
    }

    async function remove(q: BehavioralQuestion) {
        if (!window.confirm('Delete this question? This cannot be undone.')) return;
        setBusyId(q.id);
        try {
            await behavioralQuestionsService.delete(q.id);
            showToast('Question deleted.', 'success');
            invalidateQuestions();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to delete.', 'error');
        } finally {
            setBusyId(null);
        }
    }

    function handleDrop(targetId: number) {
        if (dragId === null || dragId === targetId) {
            setDragId(null);
            return;
        }
        const next = [...localQuestions];
        const fromIdx = next.findIndex((q) => q.id === dragId);
        const toIdx = next.findIndex((q) => q.id === targetId);
        setDragId(null);
        if (fromIdx === -1 || toIdx === -1) return;

        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        setLocalQuestions(next);

        behavioralQuestionsService.reorder(next.map((q) => q.id)).catch(() => {
            showToast('Failed to save new order.', 'error');
            invalidateQuestions();
        });
    }

    function openAddSet() {
        setNewSetValue('');
        setAddSetOpen(true);
    }

    function confirmAddSet(value: string) {
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
                        Trainer evaluation for trainees questionnaire
                    </h2>
                    <p className="text-xs text-neutral-500">
                        {activeCount} active of {questions.length} total
                        {selected ? ` in "${selected}"` : ''} &middot; organized
                        into sections, with rated statements and
                        written-feedback items.
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
                {pills.map((section) => (
                    <button
                        key={section}
                        type="button"
                        onClick={() => setSelected(section)}
                        className={
                            'rounded-pill px-3 py-1.5 text-xs font-medium transition-colors ' +
                            (selected === section
                                ? 'bg-brand-500 text-white'
                                : 'border border-neutral-200 text-neutral-600 hover:bg-neutral-50')
                        }
                    >
                        {section}
                    </button>
                ))}
                <button
                    type="button"
                    onClick={openAddSet}
                    className="inline-flex items-center gap-1.5 rounded-pill border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:bg-neutral-50"
                >
                    <FolderPlus size={13} />
                    Add section
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
                        placeholder="Search questions..."
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
            </div>

            {selected === null && (
                <div className="rounded-md border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                    Add a section to start building this questionnaire.
                </div>
            )}

            {selected !== null && questions.length === 0 && !questionsQuery.isLoading && (
                <div className="rounded-md border border-dashed border-neutral-200 p-8 text-center text-sm text-neutral-500">
                    No questions yet in this section.
                </div>
            )}

            {selected !== null && questions.length > 0 && (
                <div className="flex flex-col divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white">
                    {questions.map((q) => (
                        <BehavioralQuestionRow
                            key={q.id}
                            question={q}
                            draggable={canReorder}
                            dragging={dragId === q.id}
                            busy={busyId === q.id}
                            onEdit={() => {
                                setEditRow(q);
                                setQuestionModalOpen(true);
                            }}
                            onArchive={() => archive(q)}
                            onRestore={() => restore(q)}
                            onDelete={() => remove(q)}
                            onDragStart={() => setDragId(q.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDrop(q.id)}
                            onDragEnd={() => setDragId(null)}
                        />
                    ))}
                </div>
            )}

            <BehavioralQuestionModal
                sectionValue={editRow ? editRow.section : selected}
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
                title="Add section"
                maxWidth={420}
            >
                <div className="flex flex-col gap-3">
                    <p className="text-sm text-neutral-500">
                        Name the new section (e.g. "VII. Safety & Compliance").
                    </p>
                    <input
                        type="text"
                        value={newSetValue}
                        onChange={(e) => setNewSetValue(e.target.value)}
                        placeholder="Section name"
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
            </Modal>
        </div>
    );
}
