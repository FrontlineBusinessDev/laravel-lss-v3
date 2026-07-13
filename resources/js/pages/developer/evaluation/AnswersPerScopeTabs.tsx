import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import { cn } from '@/lib/utils'
import type { EvaluationResponse } from '@/types'
import type { BatchAnswerStat, SeminarAnswerStat } from './evaluationUtils'
import { IndividualAnswersModal } from './IndividualAnswersModal'

type ScopeTab = 'Batch' | 'Seminar'

export function AnswersPerScopeTabs({
  batchStats,
  seminarStats,
  responses,
}: {
  batchStats: BatchAnswerStat[]
  seminarStats: SeminarAnswerStat[]
  responses: EvaluationResponse[]
}) {
  const [tab, setTab] = useState<ScopeTab>('Batch')
  const [selected, setSelected] = useState<{ kind: ScopeTab; key: string; label: string } | null>(null)

  const selectedResponses = useMemo(() => {
    if (!selected) return []
    return selected.kind === 'Batch'
      ? responses.filter((r) => r.category === 'Trainer' && r.batchNo === selected.key)
      : responses.filter((r) => r.category === 'Seminar' && r.seminarTopic === selected.key)
  }, [selected, responses])

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">Answers received per batch &amp; seminar</h2>
        <div className="flex shrink-0 overflow-hidden rounded-md border border-neutral-200">
          {(['Batch', 'Seminar'] as ScopeTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors',
                tab === t ? 'bg-brand-500 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50',
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <p className="mb-3 text-xs text-neutral-500">Click a {tab === 'Batch' ? 'batch' : 'seminar'} to see every individual who answered.</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tab === 'Batch' &&
          batchStats.map((s) => (
            <button
              key={s.batch.id}
              onClick={() => setSelected({ kind: 'Batch', key: s.batch.batchNo, label: s.batch.batchNo })}
              className="group rounded-lg border border-neutral-200 p-3.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-medium text-ink">{s.batch.batchNo}</span>
                <StatusBadge status={s.batch.status} />
              </div>
              <div className="mb-3 text-xs text-neutral-500">{s.batch.programType} &middot; {s.batch.industry}</div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500">
                <span>Responses</span>
                <span className="font-mono font-semibold text-ink">
                  {s.totalAnswers} / {s.expected}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-pill bg-neutral-100">
                <div
                  className="h-full rounded-pill bg-brand-500"
                  style={{ width: `${s.expected ? Math.min((s.totalAnswers / s.expected) * 100, 100) : 0}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-end gap-1 text-xs font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                View individual answers <ChevronRight size={13} />
              </div>
            </button>
          ))}

        {tab === 'Seminar' &&
          seminarStats.map((s) => (
            <button
              key={s.seminar.id}
              onClick={() => setSelected({ kind: 'Seminar', key: s.seminar.topic, label: s.seminar.topic })}
              className="group rounded-lg border border-neutral-200 p-3.5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50/40"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink">{s.seminar.topic}</span>
              </div>
              <div className="mb-3 text-xs text-neutral-500">{s.seminar.type} &middot; {s.seminar.venue}</div>
              <div className="mb-1.5 flex items-center justify-between text-xs text-neutral-500">
                <span>Responses</span>
                <span className="font-mono font-semibold text-ink">
                  {s.totalAnswers} / {s.expected}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-pill bg-neutral-100">
                <div
                  className="h-full rounded-pill bg-accent-start"
                  style={{ width: `${s.expected ? Math.min((s.totalAnswers / s.expected) * 100, 100) : 0}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-end gap-1 text-xs font-medium text-brand-600 opacity-0 transition-opacity group-hover:opacity-100">
                View individual answers <ChevronRight size={13} />
              </div>
            </button>
          ))}

        {tab === 'Batch' && batchStats.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-neutral-400">No batches to show yet.</p>
        )}
        {tab === 'Seminar' && seminarStats.length === 0 && (
          <p className="col-span-full py-6 text-center text-xs text-neutral-400">No seminars to show yet.</p>
        )}
      </div>

      {selected && (
        <IndividualAnswersModal
          open={!!selected}
          onClose={() => setSelected(null)}
          title={selected.label}
          description={`Every individual response submitted for this ${selected.kind === 'Batch' ? 'batch' : 'seminar'} — expand a row to see their full answer breakdown.`}
          responses={selectedResponses}
        />
      )}
    </div>
  )
}
