import { useMemo, useState } from 'react'
import { Plus, Search, Archive, ArchiveRestore, Trash2, Pencil, ShieldCheck, Lock, X, FolderPlus, Check } from 'lucide-react'
import { Button } from '@/components/Button'
import { Dropdown } from '@/components/Dropdown'
import { RowMenu } from '@/components/RowMenu'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { TooltipIconButton } from '@/components/TooltipIconButton'
import { useToast } from '@/components/Toast'
import type { EvaluationQuestion } from '@/types'
import { cn } from '@/lib/utils'
import { AddEditQuestionModal, type QuestionFormValues } from './AddEditQuestionModal'

type PendingAction = { type: 'archive' | 'restore' | 'delete'; question: EvaluationQuestion } | null

export function QuestionsPanel({
  category,
  questions,
  onChange,
  currentUserName,
  sets,
  onAddSet,
}: {
  category: 'Trainer' | 'Seminar'
  questions: EvaluationQuestion[]
  onChange: (next: EvaluationQuestion[]) => void
  currentUserName: string
  /** Available question sets for this category (e.g. industries or seminar tracks). Scalable -- admin can add more. */
  sets: string[]
  onAddSet: (name: string) => void
}) {
  const { showToast } = useToast()
  const [activeSet, setActiveSet] = useState<string>(sets[0] ?? '')
  const [addingSet, setAddingSet] = useState(false)
  const [newSetName, setNewSetName] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EvaluationQuestion | null>(null)
  const [pending, setPending] = useState<PendingAction>(null)

  const effectiveActiveSet = sets.includes(activeSet) ? activeSet : (sets[0] ?? '')

  const scoped = useMemo(
    () => questions.filter((q) => q.category === category && q.questionSet === effectiveActiveSet),
    [questions, category, effectiveActiveSet],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return scoped
      .filter((item) => (statusFilter === 'All statuses' ? true : item.status === statusFilter.toLowerCase()))
      .filter((item) => !q || item.question.toLowerCase().includes(q) || (item.createdBy ?? '').toLowerCase().includes(q))
      .sort((a, b) => (a.createdAt && b.createdAt ? (a.createdAt < b.createdAt ? 1 : -1) : 0))
  }, [scoped, query, statusFilter])

  // Group filtered questions by section, preserving first-seen section order.
  const grouped = useMemo(() => {
    const order: string[] = []
    const map = new Map<string, EvaluationQuestion[]>()
    for (const q of filtered) {
      const key = q.section ?? 'Other'
      if (!map.has(key)) {
        map.set(key, [])
        order.push(key)
      }
      map.get(key)!.push(q)
    }
    return order.map((key) => ({ section: key, items: map.get(key)! }))
  }, [filtered])

  const activeCount = scoped.filter((q) => q.status === 'active').length

  function handleSave(values: QuestionFormValues) {
    if (editing) {
      onChange(
        questions.map((q) =>
          q.id === editing.id
            ? { ...q, question: values.question, critical: values.critical, type: values.type, section: values.section || undefined, updatedAt: new Date().toISOString() }
            : q,
        ),
      )
      showToast('Question updated.', 'success')
    } else {
      const newQuestion: EvaluationQuestion = {
        id: `eq-${Date.now()}`,
        question: values.question,
        category,
        questionSet: effectiveActiveSet,
        section: values.section || undefined,
        type: values.type,
        status: 'active',
        critical: values.critical,
        createdBy: currentUserName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      onChange([newQuestion, ...questions])
      showToast('Question added.', 'success')
    }
    setModalOpen(false)
    setEditing(null)
  }

  function runConfirmed() {
    if (!pending) return
    const { type, question } = pending
    if (type === 'archive') {
      onChange(questions.map((q) => (q.id === question.id ? { ...q, status: 'archived' } : q)))
      showToast('Question archived.', 'success')
    } else if (type === 'restore') {
      onChange(questions.map((q) => (q.id === question.id ? { ...q, status: 'active' } : q)))
      showToast('Question restored.', 'success')
    } else if (type === 'delete') {
      onChange(questions.filter((q) => q.id !== question.id))
      showToast('Question permanently deleted.', 'error')
    }
    setPending(null)
  }

  function submitNewSet() {
    const name = newSetName.trim()
    if (!name) return
    if (sets.some((s) => s.toLowerCase() === name.toLowerCase())) {
      showToast('A question set with that name already exists.', 'error')
      return
    }
    onAddSet(name)
    setActiveSet(name)
    setNewSetName('')
    setAddingSet(false)
    showToast(`"${name}" question set created.`, 'success')
  }

  const categoryLabel = category === 'Trainer' ? 'trainer' : 'seminar'

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-ink">
            {category === 'Trainer' ? 'Trainer' : 'Seminar'} evaluation questions
          </h2>
          <p className="text-xs text-neutral-500">
            {activeCount} active of {scoped.length} total in &ldquo;{effectiveActiveSet}&rdquo; &middot; used by{' '}
            {category === 'Trainer' ? 'trainees to assess trainers' : 'participants to assess resource speakers'}
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => { setEditing(null); setModalOpen(true) }} disabled={!effectiveActiveSet}>
          Add question
        </Button>
      </div>

      {/* Question set tabs -- scalable beyond just two sets per category */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-neutral-100 p-3">
        {sets.map((s) => (
          <button
            key={s}
            onClick={() => setActiveSet(s)}
            className={cn(
              'shrink-0 rounded-pill px-3 py-1.5 text-xs font-medium transition-colors',
              effectiveActiveSet === s ? 'bg-brand-500 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
            )}
          >
            {s}
          </button>
        ))}

        {addingSet ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              type="text"
              value={newSetName}
              onChange={(e) => setNewSetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNewSet()
                if (e.key === 'Escape') { setAddingSet(false); setNewSetName('') }
              }}
              placeholder="New set name (e.g. Marketing)"
              className="h-7 w-44 rounded-pill border border-neutral-200 px-3 text-xs focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <button onClick={submitNewSet} className="rounded-full p-1 text-success-700 hover:bg-success-50" aria-label="Confirm new set">
              <Check size={14} />
            </button>
            <button onClick={() => { setAddingSet(false); setNewSetName('') }} className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100" aria-label="Cancel">
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setAddingSet(true)}
            className="flex shrink-0 items-center gap-1 rounded-pill border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 hover:border-brand-300 hover:text-brand-600"
          >
            <FolderPlus size={12} /> Add set
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 border-b border-neutral-100 p-3 sm:flex-row sm:items-center">
        <div className="relative w-full flex-1 sm:max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions or author..."
            className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="w-full sm:w-40">
          <Dropdown options={['All statuses', 'Active', 'Archived']} value={statusFilter} onChange={setStatusFilter} />
        </div>
        {(query || statusFilter !== 'All statuses') && (
          <button
            onClick={() => {
              setQuery('')
              setStatusFilter('All statuses')
            }}
            className="flex h-9 items-center gap-1 rounded-md px-2 text-xs font-medium text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          >
            <X size={13} /> Clear
          </button>
        )}
        <span className="text-xs text-neutral-400 sm:ml-auto">{filtered.length} of {scoped.length}</span>
      </div>

      <div className="divide-y divide-neutral-100">
        {grouped.map(({ section, items }) => (
          <div key={section}>
            <div className="bg-neutral-50 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              {section}
            </div>
            {items.map((q) => (
              <div key={q.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={cn('text-sm', q.status === 'archived' ? 'text-neutral-400' : 'text-ink')}>{q.question}</span>
                    <span className="inline-flex items-center rounded-pill bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                      {q.type === 'text' ? 'Written' : 'Rating'}
                    </span>
                    {q.critical && (
                      <span className="inline-flex items-center gap-1 rounded-pill bg-warning-50 px-1.5 py-0.5 text-[10px] font-medium text-warning-800">
                        <Lock size={9} /> Critical
                      </span>
                    )}
                    {q.status === 'archived' && (
                      <span className="inline-flex items-center rounded-pill bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-500">
                        Archived
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    Added by {q.createdBy ?? 'Unknown'}
                    {q.createdAt && <> &middot; {new Date(q.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</>}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <TooltipIconButton icon={Pencil} label="Edit" onClick={() => { setEditing(q); setModalOpen(true) }} />
                  <RowMenu
                    actions={[
                      q.status === 'archived'
                        ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setPending({ type: 'restore', question: q }) }
                        : { label: 'Archive', icon: Archive, onClick: () => setPending({ type: 'archive', question: q }) },
                      {
                        label: q.critical ? 'Delete (protected)' : 'Delete',
                        icon: q.critical ? Lock : Trash2,
                        danger: !q.critical,
                        disabled: q.critical,
                        onClick: () => setPending({ type: 'delete', question: q }),
                      },
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-sm text-neutral-400">
            <ShieldCheck size={20} className="mx-auto mb-2 text-neutral-300" />
            {effectiveActiveSet ? 'No questions match your search or filters.' : 'Create a question set to get started.'}
          </div>
        )}
      </div>

      <AddEditQuestionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSave={handleSave}
        initial={editing}
        categoryLabel={categoryLabel}
        questionSet={effectiveActiveSet}
      />

      {pending && (
        <ConfirmDialog
          open={!!pending}
          onClose={() => setPending(null)}
          onConfirm={runConfirmed}
          title={pending.type === 'archive' ? 'Archive question' : pending.type === 'restore' ? 'Restore question' : 'Delete question'}
          tone={pending.type === 'delete' ? 'danger' : 'default'}
          confirmLabel={pending.type === 'archive' ? 'Archive' : pending.type === 'restore' ? 'Restore' : 'Delete permanently'}
          description={
            pending.type === 'archive'
              ? 'This question will be moved to archived records and hidden from new evaluation forms. You can restore it later.'
              : pending.type === 'restore'
                ? 'This question will be restored and shown on new evaluation forms again.'
                : 'This permanently deletes the question and cannot be undone. Consider archiving instead if you may need it for reference.'
          }
        />
      )}
    </div>
  )
}
