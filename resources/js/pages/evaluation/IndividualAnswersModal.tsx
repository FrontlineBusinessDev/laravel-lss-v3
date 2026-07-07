import { useState } from 'react'
import { ChevronDown, Star, ClipboardList } from 'lucide-react'
import { Modal } from '@/components/Modal'
import { StatusBadge } from '@/components/StatusBadge'
import type { EvaluationResponse } from '@/types'
import { cn } from '@/lib/utils'

/** Groups an individual response's answers by section, preserving first-seen order. */
function groupAnswers(response: EvaluationResponse) {
  const order: string[] = []
  const map = new Map<string, NonNullable<EvaluationResponse['answers']>>()
  for (const a of response.answers ?? []) {
    const key = a.section ?? 'General'
    if (!map.has(key)) {
      map.set(key, [])
      order.push(key)
    }
    map.get(key)!.push(a)
  }
  return order.map((key) => ({ section: key, items: map.get(key)! }))
}

function RespondentRow({ response }: { response: EvaluationResponse }) {
  const [open, setOpen] = useState(false)
  const grouped = groupAnswers(response)

  return (
    <div className="rounded-lg border border-neutral-200">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-ink">{response.respondentName}</p>
          <p className="truncate text-xs text-neutral-500">
            Evaluated {response.targetName} &middot;{' '}
            {new Date(response.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className="flex items-center gap-1 text-xs font-semibold text-ink">
            {response.averageScore.toFixed(1)} <Star size={11} className="fill-warning-400 text-warning-400" />
          </span>
          <StatusBadge status={response.status} />
          <ChevronDown size={15} className={cn('text-neutral-400 transition-transform', open && 'rotate-180')} />
        </div>
      </button>

      {open && (
        <div className="border-t border-neutral-100 px-3.5 py-3">
          {grouped.length === 0 && (
            <p className="text-xs text-neutral-400">No detailed answer breakdown was recorded for this submission.</p>
          )}
          <div className="flex flex-col gap-3">
            {grouped.map(({ section, items }) => (
              <div key={section}>
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{section}</p>
                <div className="flex flex-col gap-1.5">
                  {items.map((a) => (
                    <div key={a.questionId} className="flex items-start justify-between gap-3 rounded-md bg-neutral-50 px-2.5 py-2">
                      <p className="text-xs text-neutral-600">{a.question}</p>
                      {a.type === 'rating' ? (
                        <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink">
                          {a.value} <Star size={10} className="fill-warning-400 text-warning-400" />
                        </span>
                      ) : (
                        <span className="w-1/2 shrink-0 text-right text-xs italic text-neutral-500">&ldquo;{a.value}&rdquo;</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function IndividualAnswersModal({
  open,
  onClose,
  title,
  description,
  responses,
}: {
  open: boolean
  onClose: () => void
  title: string
  description: string
  responses: EvaluationResponse[]
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} maxWidth={640}>
      <div className="-mx-1 flex max-h-[60vh] flex-col gap-2 overflow-y-auto px-1 lss-scrollbar">
        {responses.map((r) => (
          <RespondentRow key={r.id} response={r} />
        ))}
        {responses.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-400">
            <ClipboardList size={20} className="mx-auto mb-2 text-neutral-300" />
            No individual responses yet for this batch or seminar.
          </div>
        )}
      </div>
    </Modal>
  )
}
