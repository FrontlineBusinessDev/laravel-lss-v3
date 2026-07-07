import { useMemo, useState, type ReactNode } from 'react'
import { Plus, Search, Pencil, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import { Button } from '@/components/Button'
import { StatusBadge } from '@/components/StatusBadge'
import { RowMenu } from '@/components/RowMenu'
import { Dropdown } from '@/components/Dropdown'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { AddAcademicLevelModal, type AcademicLevelFormValues } from './level/AddAcademicLevelModal'
import { AddAcademicProgramModal, type AcademicProgramFormValues } from './program/AddAcademicProgramModal'
import { AddLearningOutcomeModal, type LearningOutcomeFormValues } from './learning-outcomes/AddLearningOutcomeModal'
import { AddIndustryModal, type IndustryFormValues } from './industry/AddIndustryModal'
import { industries as initialIndustries, academicLevels as initialLevels, academicPrograms as initialPrograms, learningOutcomes as initialOutcomes } from '@/data/mockData'
import { useBatches } from '@/context/BatchesContext'
import type { Industry, AcademicLevel, AcademicProgram, LearningOutcome } from '@/types'
import { cn } from '@/lib/utils'

const SUB_TABS = ['Industry', 'Level', 'Program', 'Learning outcomes'] as const
type SubTab = (typeof SUB_TABS)[number]

function SearchBox({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full sm:max-w-[240px]">
      <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm shadow-card transition-colors hover:border-neutral-300 hover:shadow-none focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
    </div>
  )
}

function TableShell({ head, children, empty }: { head: string[]; children: ReactNode; empty: boolean }) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white sm:block">
      <div className="overflow-x-auto lss-scrollbar">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
              {head.map((h) => (
                <th key={h} className="px-4 py-2.5 font-medium">
                  {h}
                </th>
              ))}
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
        {empty && <div className="px-4 py-10 text-center text-sm text-neutral-400">No records match your search or filters.</div>}
      </div>
    </div>
  )
}

interface MobileCardItem {
  id: string
  title: ReactNode
  meta: ReactNode
  status: 'active' | 'archived'
  actions: import('@/components/RowMenu').RowMenuAction[]
}

/** Shared mobile fallback for AcademicTab's four near-identical config lists — each sub-tab
 *  maps its rows into this shape rather than hand-rolling its own card markup. */
function MobileCardList({ items, empty }: { items: MobileCardItem[]; empty: boolean }) {
  return (
    <div className="flex flex-col gap-2 sm:hidden">
      {items.map((item) => (
        <div key={item.id} className={cn('rounded-lg border border-neutral-200 bg-white p-3.5', item.status === 'archived' && 'opacity-60')}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className={cn('truncate text-sm font-semibold', item.status === 'archived' ? 'text-neutral-400' : 'text-ink')}>{item.title}</p>
              <div className="mt-0.5 text-xs text-neutral-500">{item.meta}</div>
            </div>
            <RowMenu actions={item.actions} />
          </div>
          <div className="mt-2">
            <StatusBadge status={item.status} />
          </div>
        </div>
      ))}
      {empty && (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
          No records match your search or filters.
        </div>
      )}
    </div>
  )
}

type ArchivableStatus = { id: string; status: 'active' | 'archived' }
type PendingAction<T> = { type: 'archive' | 'restore' | 'delete'; item: T } | null

export function AcademicTab() {
  const { trainees } = useBatches()
  const { showToast } = useToast()
  const [sub, setSub] = useState<SubTab>('Industry')

  // ---------- Industry ----------
  const [industries, setIndustries] = useState<Industry[]>(initialIndustries)
  const [industryQuery, setIndustryQuery] = useState('')
  const [industryStatusFilter, setIndustryStatusFilter] = useState('All statuses')
  const [industryModal, setIndustryModal] = useState(false)
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)
  const [industryPending, setIndustryPending] = useState<PendingAction<Industry>>(null)

  const filteredIndustries = useMemo(() => {
    const q = industryQuery.trim().toLowerCase()
    return industries.filter((i) => {
      const matchesQuery = !q || i.name.toLowerCase().includes(q) || i.matchedPrograms.some((p) => p.toLowerCase().includes(q))
      const matchesStatus = industryStatusFilter === 'All statuses' || i.status === industryStatusFilter.toLowerCase()
      return matchesQuery && matchesStatus
    })
  }, [industries, industryQuery, industryStatusFilter])

  function saveIndustry(values: IndustryFormValues) {
    if (editingIndustry) {
      setIndustries((prev) => prev.map((i) => (i.id === editingIndustry.id ? { ...i, ...values } : i)))
      showToast(`${values.name} was updated.`, 'success')
    } else {
      setIndustries((prev) => [{ id: `i${Date.now()}`, batches: 0, status: 'active', ...values }, ...prev])
      showToast(`${values.name} was added.`, 'success')
    }
    setIndustryModal(false)
    setEditingIndustry(null)
  }

  // ---------- Level ----------
  const [academicLevels, setAcademicLevels] = useState<AcademicLevel[]>(initialLevels)
  const [levelQuery, setLevelQuery] = useState('')
  const [levelModal, setLevelModal] = useState(false)
  const [editingLevel, setEditingLevel] = useState<AcademicLevel | null>(null)
  const [levelPending, setLevelPending] = useState<PendingAction<AcademicLevel>>(null)

  const filteredLevels = useMemo(() => {
    const q = levelQuery.trim().toLowerCase()
    return academicLevels.filter((l) => !q || l.level.toLowerCase().includes(q) || l.yearLevel.toLowerCase().includes(q))
  }, [academicLevels, levelQuery])

  function saveLevel(values: AcademicLevelFormValues) {
    if (editingLevel) {
      setAcademicLevels((prev) => prev.map((l) => (l.id === editingLevel.id ? { ...l, ...values } : l)))
      showToast(`${values.level} \u2013 ${values.yearLevel} was updated.`, 'success')
    } else {
      setAcademicLevels((prev) => [{ id: `l${Date.now()}`, status: 'active', ...values }, ...prev])
      showToast(`${values.level} \u2013 ${values.yearLevel} was added.`, 'success')
    }
    setLevelModal(false)
    setEditingLevel(null)
  }

  // ---------- Program ----------
  const [academicPrograms, setAcademicPrograms] = useState<AcademicProgram[]>(initialPrograms)
  const [programQuery, setProgramQuery] = useState('')
  const [programModal, setProgramModal] = useState(false)
  const [editingProgram, setEditingProgram] = useState<AcademicProgram | null>(null)
  const [programPending, setProgramPending] = useState<PendingAction<AcademicProgram>>(null)

  const filteredPrograms = useMemo(() => {
    const q = programQuery.trim().toLowerCase()
    return academicPrograms.filter((p) => !q || p.program.toLowerCase().includes(q) || p.course.toLowerCase().includes(q) || p.specialization.toLowerCase().includes(q))
  }, [academicPrograms, programQuery])

  function saveProgram(values: AcademicProgramFormValues) {
    if (editingProgram) {
      setAcademicPrograms((prev) => prev.map((p) => (p.id === editingProgram.id ? { ...p, ...values } : p)))
      showToast(`${values.course} was updated.`, 'success')
    } else {
      setAcademicPrograms((prev) => [{ id: `p${Date.now()}`, status: 'active', ...values }, ...prev])
      showToast(`${values.course} was added.`, 'success')
    }
    setProgramModal(false)
    setEditingProgram(null)
  }

  // ---------- Learning outcomes ----------
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>(initialOutcomes)
  const [outcomeQuery, setOutcomeQuery] = useState('')
  const [outcomeIndustryFilter, setOutcomeIndustryFilter] = useState('All industries')
  const [outcomeModal, setOutcomeModal] = useState(false)
  const [editingOutcome, setEditingOutcome] = useState<LearningOutcome | null>(null)
  const [outcomePending, setOutcomePending] = useState<PendingAction<LearningOutcome>>(null)

  const outcomeAchievedCount = useMemo(() => {
    const counts = new Map<string, number>()
    for (const t of trainees) {
      for (const id of t.achievedOutcomeIds) {
        counts.set(id, (counts.get(id) ?? 0) + 1)
      }
    }
    return counts
  }, [trainees])

  const filteredOutcomes = useMemo(() => {
    const q = outcomeQuery.trim().toLowerCase()
    return learningOutcomes.filter((o) => {
      const matchesQuery = !q || o.outcome.toLowerCase().includes(q)
      const matchesIndustry = outcomeIndustryFilter === 'All industries' || o.industry === outcomeIndustryFilter
      return matchesQuery && matchesIndustry
    })
  }, [learningOutcomes, outcomeQuery, outcomeIndustryFilter])

  function saveOutcome(values: LearningOutcomeFormValues) {
    if (editingOutcome) {
      setLearningOutcomes((prev) => prev.map((o) => (o.id === editingOutcome.id ? { ...o, ...values } : o)))
      showToast('Learning outcome was updated.', 'success')
    } else {
      setLearningOutcomes((prev) => [{ id: `o${Date.now()}`, status: 'active', ...values }, ...prev])
      showToast('Learning outcome was added.', 'success')
    }
    setOutcomeModal(false)
    setEditingOutcome(null)
  }

  // ---------- shared archive/restore/delete helpers ----------
  function toggleArchive<T extends ArchivableStatus>(list: T[], setList: (v: T[]) => void, id: string, next: 'active' | 'archived') {
    setList(list.map((item) => (item.id === id ? { ...item, status: next } : item)))
  }
  function remove<T extends { id: string }>(list: T[], setList: (v: T[]) => void, id: string) {
    setList(list.filter((item) => item.id !== id))
  }

  return (
    <div>
      <div className="mb-3.5 flex flex-wrap gap-1.5">
        {SUB_TABS.map((t) => (
          <button
            key={t}
            onClick={() => setSub(t)}
            className={cn(
              'rounded-pill px-3 py-1.5 text-xs font-medium transition-all duration-150 active:scale-[0.97]',
              sub === t ? 'bg-brand-500 text-white' : 'border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {sub === 'Industry' && (
        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <SearchBox placeholder="Search industries..." value={industryQuery} onChange={setIndustryQuery} />
              <div className="w-full sm:w-40">
                <Dropdown options={['All statuses', 'Active', 'Archived']} value={industryStatusFilter} onChange={setIndustryStatusFilter} />
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingIndustry(null)
                setIndustryModal(true)
              }}
            >
              Add industry
            </Button>
          </div>
          <TableShell head={['Industry', 'Matched program types', 'Batches', 'Status']} empty={filteredIndustries.length === 0}>
            {filteredIndustries.map((i) => (
              <tr key={i.id} className={cn('border-t border-neutral-100 transition-colors hover:bg-neutral-50', i.status === 'archived' && 'text-neutral-400')}>
                <td className={cn('px-4 py-2.5 font-medium', i.status === 'archived' ? 'text-neutral-400' : 'text-ink')}>{i.name}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">{i.matchedPrograms.length ? i.matchedPrograms.join(', ') : '\u2014'}</td>
                <td className="px-4 py-2.5 text-ink">{i.batches}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={i.status} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <RowMenu
                    actions={[
                      {
                        label: 'Edit industry',
                        icon: Pencil,
                        onClick: () => {
                          setEditingIndustry(i)
                          setIndustryModal(true)
                        },
                      },
                      i.status === 'archived'
                        ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setIndustryPending({ type: 'restore', item: i }) }
                        : { label: 'Archive', icon: Archive, onClick: () => setIndustryPending({ type: 'archive', item: i }) },
                      { label: 'Delete', icon: Trash2, danger: true, onClick: () => setIndustryPending({ type: 'delete', item: i }) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </TableShell>
          <MobileCardList
            empty={filteredIndustries.length === 0}
            items={filteredIndustries.map((i) => ({
              id: i.id,
              title: i.name,
              meta: i.matchedPrograms.length ? i.matchedPrograms.join(', ') : `${i.batches} batch${i.batches === 1 ? '' : 'es'}`,
              status: i.status,
              actions: [
                { label: 'Edit industry', icon: Pencil, onClick: () => { setEditingIndustry(i); setIndustryModal(true) } },
                i.status === 'archived'
                  ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setIndustryPending({ type: 'restore', item: i }) }
                  : { label: 'Archive', icon: Archive, onClick: () => setIndustryPending({ type: 'archive', item: i }) },
                { label: 'Delete', icon: Trash2, danger: true, onClick: () => setIndustryPending({ type: 'delete', item: i }) },
              ],
            }))}
          />
          <AddIndustryModal
            open={industryModal}
            onClose={() => setIndustryModal(false)}
            onSave={saveIndustry}
            initial={editingIndustry}
          />
          {industryPending && (
            <ConfirmDialog
              open={!!industryPending}
              onClose={() => setIndustryPending(null)}
              onConfirm={() => {
                const { type, item } = industryPending
                if (type === 'archive') {
                  toggleArchive(industries, setIndustries, item.id, 'archived')
                  showToast(`${item.name} was archived.`, 'success')
                } else if (type === 'restore') {
                  toggleArchive(industries, setIndustries, item.id, 'active')
                  showToast(`${item.name} was restored.`, 'success')
                } else {
                  remove(industries, setIndustries, item.id)
                  showToast(`${item.name} was deleted.`, 'error')
                }
                setIndustryPending(null)
              }}
              title={industryPending.type === 'archive' ? 'Archive industry' : industryPending.type === 'restore' ? 'Restore industry' : 'Delete industry'}
              tone={industryPending.type === 'delete' ? 'danger' : 'default'}
              confirmLabel={industryPending.type === 'archive' ? 'Archive' : industryPending.type === 'restore' ? 'Restore' : 'Delete permanently'}
              confirmDisabled={industryPending.type === 'delete' && industryPending.item.batches > 0}
              description={
                industryPending.type === 'archive'
                  ? `${industryPending.item.name} will be moved to archived records.`
                  : industryPending.type === 'restore'
                    ? `${industryPending.item.name} will be restored to active records.`
                    : industryPending.item.batches > 0
                      ? `${industryPending.item.name} has ${industryPending.item.batches} batch(es) linked to it and can\u2019t be permanently deleted. Archive it instead.`
                      : `This permanently deletes ${industryPending.item.name} and cannot be undone.`
              }
            />
          )}
        </div>
      )}

      {sub === 'Level' && (
        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchBox placeholder="Search levels..." value={levelQuery} onChange={setLevelQuery} />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingLevel(null)
                setLevelModal(true)
              }}
            >
              Add level
            </Button>
          </div>
          <TableShell head={['Academic level', 'Year level', 'Description', 'Status']} empty={filteredLevels.length === 0}>
            {filteredLevels.map((l) => (
              <tr key={l.id} className={cn('border-t border-neutral-100 transition-colors hover:bg-neutral-50', l.status === 'archived' && 'text-neutral-400')}>
                <td className={cn('px-4 py-2.5 font-medium', l.status === 'archived' ? 'text-neutral-400' : 'text-ink')}>{l.level}</td>
                <td className="px-4 py-2.5 text-neutral-600">{l.yearLevel}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">{l.description || '\u2014'}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <RowMenu
                    actions={[
                      {
                        label: 'Edit level',
                        icon: Pencil,
                        onClick: () => {
                          setEditingLevel(l)
                          setLevelModal(true)
                        },
                      },
                      l.status === 'archived'
                        ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setLevelPending({ type: 'restore', item: l }) }
                        : { label: 'Archive', icon: Archive, onClick: () => setLevelPending({ type: 'archive', item: l }) },
                      { label: 'Delete', icon: Trash2, danger: true, onClick: () => setLevelPending({ type: 'delete', item: l }) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </TableShell>
          <MobileCardList
            empty={filteredLevels.length === 0}
            items={filteredLevels.map((l) => ({
              id: l.id,
              title: `${l.level} \u2013 ${l.yearLevel}`,
              meta: l.description || '\u2014',
              status: l.status,
              actions: [
                { label: 'Edit level', icon: Pencil, onClick: () => { setEditingLevel(l); setLevelModal(true) } },
                l.status === 'archived'
                  ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setLevelPending({ type: 'restore', item: l }) }
                  : { label: 'Archive', icon: Archive, onClick: () => setLevelPending({ type: 'archive', item: l }) },
                { label: 'Delete', icon: Trash2, danger: true, onClick: () => setLevelPending({ type: 'delete', item: l }) },
              ],
            }))}
          />
          <AddAcademicLevelModal open={levelModal} onClose={() => setLevelModal(false)} onSave={saveLevel} initial={editingLevel} />
          {levelPending && (
            <ConfirmDialog
              open={!!levelPending}
              onClose={() => setLevelPending(null)}
              onConfirm={() => {
                const { type, item } = levelPending
                if (type === 'archive') {
                  toggleArchive(academicLevels, setAcademicLevels, item.id, 'archived')
                  showToast(`${item.level} \u2013 ${item.yearLevel} was archived.`, 'success')
                } else if (type === 'restore') {
                  toggleArchive(academicLevels, setAcademicLevels, item.id, 'active')
                  showToast(`${item.level} \u2013 ${item.yearLevel} was restored.`, 'success')
                } else {
                  remove(academicLevels, setAcademicLevels, item.id)
                  showToast(`${item.level} \u2013 ${item.yearLevel} was deleted.`, 'error')
                }
                setLevelPending(null)
              }}
              title={levelPending.type === 'archive' ? 'Archive level' : levelPending.type === 'restore' ? 'Restore level' : 'Delete level'}
              tone={levelPending.type === 'delete' ? 'danger' : 'default'}
              confirmLabel={levelPending.type === 'archive' ? 'Archive' : levelPending.type === 'restore' ? 'Restore' : 'Delete permanently'}
              description={
                levelPending.type === 'archive'
                  ? `${levelPending.item.level} \u2013 ${levelPending.item.yearLevel} will be moved to archived records.`
                  : levelPending.type === 'restore'
                    ? `${levelPending.item.level} \u2013 ${levelPending.item.yearLevel} will be restored to active records.`
                    : `This permanently deletes ${levelPending.item.level} \u2013 ${levelPending.item.yearLevel} and cannot be undone.`
              }
            />
          )}
        </div>
      )}

      {sub === 'Program' && (
        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchBox placeholder="Search programs..." value={programQuery} onChange={setProgramQuery} />
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingProgram(null)
                setProgramModal(true)
              }}
            >
              Add program
            </Button>
          </div>
          <TableShell head={['Program', 'Course', 'Specialization', 'Status']} empty={filteredPrograms.length === 0}>
            {filteredPrograms.map((p) => (
              <tr key={p.id} className={cn('border-t border-neutral-100 transition-colors hover:bg-neutral-50', p.status === 'archived' && 'text-neutral-400')}>
                <td className={cn('px-4 py-2.5 font-medium', p.status === 'archived' ? 'text-neutral-400' : 'text-ink')}>{p.program}</td>
                <td className="px-4 py-2.5 text-neutral-600">{p.course}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">{p.specialization || '\u2014'}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <RowMenu
                    actions={[
                      {
                        label: 'Edit program',
                        icon: Pencil,
                        onClick: () => {
                          setEditingProgram(p)
                          setProgramModal(true)
                        },
                      },
                      p.status === 'archived'
                        ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setProgramPending({ type: 'restore', item: p }) }
                        : { label: 'Archive', icon: Archive, onClick: () => setProgramPending({ type: 'archive', item: p }) },
                      { label: 'Delete', icon: Trash2, danger: true, onClick: () => setProgramPending({ type: 'delete', item: p }) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </TableShell>
          <MobileCardList
            empty={filteredPrograms.length === 0}
            items={filteredPrograms.map((p) => ({
              id: p.id,
              title: p.program,
              meta: `${p.course}${p.specialization ? ` · ${p.specialization}` : ''}`,
              status: p.status,
              actions: [
                { label: 'Edit program', icon: Pencil, onClick: () => { setEditingProgram(p); setProgramModal(true) } },
                p.status === 'archived'
                  ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setProgramPending({ type: 'restore', item: p }) }
                  : { label: 'Archive', icon: Archive, onClick: () => setProgramPending({ type: 'archive', item: p }) },
                { label: 'Delete', icon: Trash2, danger: true, onClick: () => setProgramPending({ type: 'delete', item: p }) },
              ],
            }))}
          />
          <AddAcademicProgramModal open={programModal} onClose={() => setProgramModal(false)} onSave={saveProgram} initial={editingProgram} />
          {programPending && (
            <ConfirmDialog
              open={!!programPending}
              onClose={() => setProgramPending(null)}
              onConfirm={() => {
                const { type, item } = programPending
                if (type === 'archive') {
                  toggleArchive(academicPrograms, setAcademicPrograms, item.id, 'archived')
                  showToast(`${item.course} was archived.`, 'success')
                } else if (type === 'restore') {
                  toggleArchive(academicPrograms, setAcademicPrograms, item.id, 'active')
                  showToast(`${item.course} was restored.`, 'success')
                } else {
                  remove(academicPrograms, setAcademicPrograms, item.id)
                  showToast(`${item.course} was deleted.`, 'error')
                }
                setProgramPending(null)
              }}
              title={programPending.type === 'archive' ? 'Archive program' : programPending.type === 'restore' ? 'Restore program' : 'Delete program'}
              tone={programPending.type === 'delete' ? 'danger' : 'default'}
              confirmLabel={programPending.type === 'archive' ? 'Archive' : programPending.type === 'restore' ? 'Restore' : 'Delete permanently'}
              description={
                programPending.type === 'archive'
                  ? `${programPending.item.course} will be moved to archived records.`
                  : programPending.type === 'restore'
                    ? `${programPending.item.course} will be restored to active records.`
                    : `This permanently deletes ${programPending.item.course} and cannot be undone.`
              }
            />
          )}
        </div>
      )}

      {sub === 'Learning outcomes' && (
        <div>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <SearchBox placeholder="Search outcomes..." value={outcomeQuery} onChange={setOutcomeQuery} />
              <div className="w-full sm:w-48">
                <Dropdown
                  options={['All industries', 'Information technology', 'Accounting', 'Hospitality', 'Marketing', 'Engineering']}
                  value={outcomeIndustryFilter}
                  onChange={setOutcomeIndustryFilter}
                />
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              className="w-full sm:w-auto"
              onClick={() => {
                setEditingOutcome(null)
                setOutcomeModal(true)
              }}
            >
              Add outcome
            </Button>
          </div>
          <TableShell head={['Learning outcome', 'Industry', 'Achieved by', 'Status']} empty={filteredOutcomes.length === 0}>
            {filteredOutcomes.map((o) => (
              <tr
                key={o.id}
                className={cn(
                  'border-t border-neutral-100 transition-colors hover:bg-neutral-50',
                  o.status === 'archived' && 'text-neutral-400',
                )}
              >
                <td className={cn('px-4 py-2.5', o.status === 'active' ? 'text-ink' : 'text-neutral-400')}>{o.outcome}</td>
                <td className="px-4 py-2.5 text-xs text-neutral-500">{o.industry}</td>
                <td className="px-4 py-2.5 text-neutral-600">{outcomeAchievedCount.get(o.id) ?? 0} trainee{(outcomeAchievedCount.get(o.id) ?? 0) === 1 ? '' : 's'}</td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-2.5 text-right">
                  <RowMenu
                    actions={[
                      {
                        label: 'Edit outcome',
                        icon: Pencil,
                        onClick: () => {
                          setEditingOutcome(o)
                          setOutcomeModal(true)
                        },
                      },
                      o.status === 'archived'
                        ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setOutcomePending({ type: 'restore', item: o }) }
                        : { label: 'Archive', icon: Archive, onClick: () => setOutcomePending({ type: 'archive', item: o }) },
                      { label: 'Delete', icon: Trash2, danger: true, onClick: () => setOutcomePending({ type: 'delete', item: o }) },
                    ]}
                  />
                </td>
              </tr>
            ))}
          </TableShell>
          <MobileCardList
            empty={filteredOutcomes.length === 0}
            items={filteredOutcomes.map((o) => ({
              id: o.id,
              title: o.outcome,
              meta: `${o.industry} · Achieved by ${outcomeAchievedCount.get(o.id) ?? 0} trainee${(outcomeAchievedCount.get(o.id) ?? 0) === 1 ? '' : 's'}`,
              status: o.status,
              actions: [
                { label: 'Edit outcome', icon: Pencil, onClick: () => { setEditingOutcome(o); setOutcomeModal(true) } },
                o.status === 'archived'
                  ? { label: 'Restore', icon: ArchiveRestore, onClick: () => setOutcomePending({ type: 'restore', item: o }) }
                  : { label: 'Archive', icon: Archive, onClick: () => setOutcomePending({ type: 'archive', item: o }) },
                { label: 'Delete', icon: Trash2, danger: true, onClick: () => setOutcomePending({ type: 'delete', item: o }) },
              ],
            }))}
          />
          <AddLearningOutcomeModal open={outcomeModal} onClose={() => setOutcomeModal(false)} onSave={saveOutcome} initial={editingOutcome} />
          {outcomePending && (
            <ConfirmDialog
              open={!!outcomePending}
              onClose={() => setOutcomePending(null)}
              onConfirm={() => {
                const { type, item } = outcomePending
                if (type === 'archive') {
                  toggleArchive(learningOutcomes, setLearningOutcomes, item.id, 'archived')
                  showToast('Learning outcome was archived.', 'success')
                } else if (type === 'restore') {
                  toggleArchive(learningOutcomes, setLearningOutcomes, item.id, 'active')
                  showToast('Learning outcome was restored.', 'success')
                } else {
                  remove(learningOutcomes, setLearningOutcomes, item.id)
                  showToast('Learning outcome was deleted.', 'error')
                }
                setOutcomePending(null)
              }}
              title={outcomePending.type === 'archive' ? 'Archive outcome' : outcomePending.type === 'restore' ? 'Restore outcome' : 'Delete outcome'}
              tone={outcomePending.type === 'delete' ? 'danger' : 'default'}
              confirmLabel={outcomePending.type === 'archive' ? 'Archive' : outcomePending.type === 'restore' ? 'Restore' : 'Delete permanently'}
              confirmDisabled={outcomePending.type === 'delete' && (outcomeAchievedCount.get(outcomePending.item.id) ?? 0) > 0}
              description={
                outcomePending.type === 'archive'
                  ? 'This learning outcome will be moved to archived records.'
                  : outcomePending.type === 'restore'
                    ? 'This learning outcome will be restored to active records.'
                    : (outcomeAchievedCount.get(outcomePending.item.id) ?? 0) > 0
                      ? `This outcome has already been achieved by ${outcomeAchievedCount.get(outcomePending.item.id)} trainee${(outcomeAchievedCount.get(outcomePending.item.id) ?? 0) === 1 ? '' : 's'} and can\u2019t be permanently deleted, since that would erase their record. Archive it instead to keep it out of new assignments.`
                      : 'This permanently deletes this learning outcome and cannot be undone.'
              }
            />
          )}
        </div>
      )}
    </div>
  )
}
