import { useEffect, useMemo, useState } from 'react';
import {
    Plus,
    Search,
    Archive,
    ArchiveRestore,
    Pencil,
    Trash2,
    Lock,
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { TextAreaField, SelectField } from '@/components/FormField';
import { useToast } from '@/components/Toast';
import { ApiError } from '@/api-service-layer/client';
import { behavioralQuestionsService } from '@/api-service-layer/admin/behavioral-ratings';
import type { BehavioralQuestion } from '@/types/modules/ratings/behavioral';
import { cn } from '@/lib/utils';

type Filter = 'active' | 'archived' | 'all';

const SECTIONS = [
    'I. Work Performance & Discipline',
    'II. Learning Ability & Technical Growth',
    'III. Teamwork & Professional Behavior',
    'IV. Technical Competency & Job Readiness',
    "V. Trainer's General Evaluation of the Trainee",
    'VI. Written Feedback',
];

const TYPE_LABEL: Record<BehavioralQuestion['type'], string> = {
    rating: 'Rated 1–5',
    text: 'Written response',
};

export function BehavioralAssessmentSetup() {
    const { showToast } = useToast();
    const [questions, setQuestions] = useState<BehavioralQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState<Filter>('active');

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<BehavioralQuestion | null>(null);
    const [draftText, setDraftText] = useState('');
    const [draftSection, setDraftSection] = useState(SECTIONS[0]);
    const [draftType, setDraftType] =
        useState<BehavioralQuestion['type']>('rating');
    const [draftCritical, setDraftCritical] = useState(false);
    const [saving, setSaving] = useState(false);

    const [archiveTarget, setArchiveTarget] =
        useState<BehavioralQuestion | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<BehavioralQuestion | null>(
        null,
    );

    async function loadQuestions() {
        setLoading(true);
        try {
            const data = await behavioralQuestionsService.list();
            setQuestions(data);
        } catch {
            showToast('Failed to load questions.', 'error');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadQuestions();
    }, []);

    const filtered = questions
        .filter((q) =>
            filter === 'all' ? true : q.status === (filter === 'archived' ? 'inactive' : 'active'),
        )
        .filter((q) => q.question.toLowerCase().includes(query.toLowerCase()))
        .sort((a, b) => a.order - b.order);

    const grouped = useMemo(() => {
        const map = new Map<string, BehavioralQuestion[]>();
        SECTIONS.forEach((s) => map.set(s, []));
        filtered.forEach((q) => {
            if (!map.has(q.section)) map.set(q.section, []);
            map.get(q.section)!.push(q);
        });
        return Array.from(map.entries()).filter(([, qs]) => qs.length > 0);
    }, [filtered]);

    const activeCount = questions.filter((q) => q.status === 'active').length;
    const archivedCount = questions.filter(
        (q) => q.status === 'inactive',
    ).length;

    function openAdd() {
        setEditing(null);
        setDraftText('');
        setDraftSection(SECTIONS[0]);
        setDraftType('rating');
        setDraftCritical(false);
        setFormOpen(true);
    }

    function openEdit(q: BehavioralQuestion) {
        setEditing(q);
        setDraftText(q.question);
        setDraftSection(q.section);
        setDraftType(q.type);
        setDraftCritical(q.is_critical);
        setFormOpen(true);
    }

    async function saveQuestion() {
        const text = draftText.trim();
        if (!text) {
            showToast('Enter the question text before saving.', 'error');
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                await behavioralQuestionsService.update(editing.id, {
                    question: text,
                    section: draftSection,
                    type: draftType,
                    is_critical: draftCritical,
                });
                showToast('Question updated.', 'success');
            } else {
                const nextOrder = questions.length
                    ? Math.max(...questions.map((q) => q.order)) + 1
                    : 1;
                await behavioralQuestionsService.create({
                    question: text,
                    section: draftSection,
                    type: draftType,
                    order: nextOrder,
                    is_critical: draftCritical,
                });
                showToast('Question added.', 'success');
            }
            setFormOpen(false);
            await loadQuestions();
        } catch {
            showToast('Failed to save question.', 'error');
        } finally {
            setSaving(false);
        }
    }

    async function confirmArchive() {
        if (!archiveTarget) return;
        const willArchive = archiveTarget.status === 'active';
        try {
            if (willArchive) {
                await behavioralQuestionsService.archive(archiveTarget.id);
            } else {
                await behavioralQuestionsService.restore(archiveTarget.id);
            }
            showToast(
                willArchive ? 'Question archived.' : 'Question restored.',
                'success',
            );
            await loadQuestions();
        } catch {
            showToast('Failed to update question.', 'error');
        } finally {
            setArchiveTarget(null);
        }
    }

    async function restoreDirect(q: BehavioralQuestion) {
        try {
            await behavioralQuestionsService.restore(q.id);
            showToast('Question restored.', 'success');
            await loadQuestions();
        } catch {
            showToast('Failed to restore question.', 'error');
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        try {
            await behavioralQuestionsService.delete(deleteTarget.id);
            showToast('Question permanently deleted.', 'success');
            await loadQuestions();
        } catch (err) {
            const message =
                err instanceof ApiError
                    ? err.message
                    : 'Failed to delete question.';
            showToast(message, 'error');
        } finally {
            setDeleteTarget(null);
        }
    }

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-neutral-500">
                    Manage the Trainer Evaluation for Trainees questionnaire —
                    organized into sections, with rated statements and
                    written-feedback items.
                </p>
                <Button variant="primary" icon={Plus} onClick={openAdd}>
                    Add question
                </Button>
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-3">
                <div className="relative w-full max-w-xs">
                    <Search
                        size={14}
                        className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-neutral-400"
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search questions..."
                        className="h-9 w-full rounded-md border border-neutral-200 pr-2.5 pl-8 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
                    />
                </div>
                <div className="flex items-center gap-1 rounded-md border border-neutral-200 bg-neutral-50 p-0.5">
                    {(
                        [
                            ['active', `Active (${activeCount})`],
                            ['archived', `Archived (${archivedCount})`],
                            ['all', 'All'],
                        ] as [Filter, string][]
                    ).map(([key, label]) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={cn(
                                'rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
                                filter === key
                                    ? 'bg-white text-ink shadow-card'
                                    : 'text-neutral-500 hover:text-neutral-700',
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-xs text-neutral-400">
                    Loading questions...
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {grouped.map(([section, qs]) => (
                        <div
                            key={section}
                            className="overflow-hidden rounded-lg border border-neutral-200 bg-white"
                        >
                            <div className="border-b border-neutral-100 bg-neutral-50 px-4 py-2.5 text-xs font-semibold text-neutral-600">
                                {section}
                            </div>
                            <div className="divide-y divide-neutral-100">
                                {qs.map((q, i) => (
                                    <div
                                        key={q.id}
                                        className="flex items-center justify-between gap-3 px-4 py-3"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span className="mt-0.5 shrink-0 font-mono text-xs text-neutral-400">
                                                {i + 1}.
                                            </span>
                                            <div className="min-w-0">
                                                <span
                                                    className={cn(
                                                        'text-sm',
                                                        q.status === 'inactive'
                                                            ? 'text-neutral-400'
                                                            : 'text-ink',
                                                    )}
                                                >
                                                    {q.question}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'ml-2 inline-flex items-center rounded-pill px-2 py-0.5 text-[11px] font-medium',
                                                        q.type === 'rating'
                                                            ? 'bg-brand-50 text-brand-600'
                                                            : 'bg-neutral-100 text-neutral-500',
                                                    )}
                                                >
                                                    {TYPE_LABEL[q.type]}
                                                </span>
                                                {q.status === 'inactive' && (
                                                    <span className="ml-2 inline-flex items-center rounded-pill bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-500">
                                                        Archived
                                                    </span>
                                                )}
                                                {q.is_critical && (
                                                    <span className="ml-2 inline-flex items-center gap-1 text-[11px] text-neutral-400">
                                                        <Lock size={11} />{' '}
                                                        Critical — cannot be
                                                        deleted
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <button
                                                onClick={() => openEdit(q)}
                                                aria-label="Edit question"
                                                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                                            >
                                                <Pencil size={13} /> Edit
                                            </button>
                                            {q.status === 'active' ? (
                                                <button
                                                    onClick={() =>
                                                        setArchiveTarget(q)
                                                    }
                                                    className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
                                                >
                                                    <Archive size={13} />{' '}
                                                    Archive
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        restoreDirect(q)
                                                    }
                                                    className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-brand-600 transition-colors hover:bg-brand-50"
                                                >
                                                    <ArchiveRestore
                                                        size={13}
                                                    />{' '}
                                                    Restore
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    q.status === 'inactive' &&
                                                    setDeleteTarget(q)
                                                }
                                                disabled={
                                                    q.status !== 'inactive'
                                                }
                                                title={
                                                    q.status !== 'inactive'
                                                        ? 'Archive before deleting.'
                                                        : q.is_critical
                                                          ? 'Critical questions cannot be deleted.'
                                                          : 'Delete permanently'
                                                }
                                                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-danger-600 transition-colors hover:bg-danger-50 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent"
                                            >
                                                <Trash2 size={13} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {grouped.length === 0 && (
                        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-10 text-center text-xs text-neutral-400">
                            {query
                                ? 'No questions match your search.'
                                : 'No questions in this view yet.'}
                        </div>
                    )}
                </div>
            )}

            {/* Add / edit question */}
            <Modal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                title={editing ? 'Edit question' : 'Add question'}
                maxWidth={460}
            >
                <SelectField
                    label="Section"
                    options={SECTIONS}
                    value={draftSection}
                    onChange={(e) => setDraftSection(e.target.value)}
                />
                <SelectField
                    label="Response type"
                    options={['Rated 1–5', 'Written response']}
                    value={TYPE_LABEL[draftType]}
                    onChange={(e) =>
                        setDraftType(
                            e.target.value === 'Rated 1–5' ? 'rating' : 'text',
                        )
                    }
                />
                <TextAreaField
                    label="Question"
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="e.g. The trainee follows workplace policies, procedures, and instructions."
                    rows={3}
                />
                <label className="mb-4 flex items-center gap-2 text-sm text-ink">
                    <input
                        type="checkbox"
                        checked={draftCritical}
                        onChange={(e) => setDraftCritical(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-300"
                    />
                    Critical question (can never be permanently deleted)
                </label>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        className="flex-1"
                        onClick={() => setFormOpen(false)}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        className="flex-1"
                        onClick={saveQuestion}
                        disabled={saving}
                    >
                        {editing ? 'Save changes' : 'Add question'}
                    </Button>
                </div>
            </Modal>

            {/* Archive / restore confirm */}
            <ConfirmDialog
                open={!!archiveTarget}
                onClose={() => setArchiveTarget(null)}
                onConfirm={confirmArchive}
                title={
                    archiveTarget?.status === 'active'
                        ? 'Archive question?'
                        : 'Restore question?'
                }
                description={
                    archiveTarget?.status === 'active'
                        ? 'This question will be hidden from new evaluations but kept for historical records. You can restore it anytime.'
                        : 'This question will become available again in new behavioral evaluations.'
                }
                confirmLabel={
                    archiveTarget?.status === 'active' ? 'Archive' : 'Restore'
                }
            />

            {/* Permanent delete confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title="Delete question permanently?"
                description={
                    deleteTarget?.is_critical
                        ? 'This question is marked critical and cannot be permanently deleted. Keep it archived instead.'
                        : "This cannot be undone. If it's still referenced by a submitted evaluation, deletion will be blocked — archive it instead."
                }
                confirmLabel="Delete permanently"
                tone="danger"
            />
        </div>
    );
}
