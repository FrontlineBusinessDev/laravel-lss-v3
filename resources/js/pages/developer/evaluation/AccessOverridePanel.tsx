import { useMemo, useState } from 'react'
import { Search, ShieldAlert, FileWarning } from 'lucide-react'
import { useBatches } from '@/context/BatchesContext'
import { useToast } from '@/components/Toast'
import { cn } from '@/lib/utils'

export function AccessOverridePanel() {
  const { trainees, setEvaluationAccessOverride } = useBatches()
  const { showToast } = useToast()
  const [query, setQuery] = useState('')

  const incomplete = useMemo(
    () =>
      trainees
        .filter((t) => !t.archived && !t.documentsComplete)
        .filter((t) => !query.trim() || t.name.toLowerCase().includes(query.trim().toLowerCase()) || t.batchNo.toLowerCase().includes(query.trim().toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [trainees, query],
  )

  function toggle(traineeId: string, allowed: boolean, name: string) {
    setEvaluationAccessOverride(traineeId, allowed)
    showToast(
      allowed
        ? `${name} can now access the evaluation form despite incomplete documents.`
        : `Evaluation access override removed for ${name}.`,
      'success',
    )
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-start gap-2 border-b border-neutral-200 p-4">
        <ShieldAlert size={15} className="mt-0.5 shrink-0 text-warning-600" />
        <div>
          <h2 className="text-sm font-semibold text-ink">Evaluation access overrides</h2>
          <p className="text-xs text-neutral-500">
            Trainees with incomplete documents are normally blocked from the evaluation form. Grant an override below to let a specific trainee proceed anyway.
          </p>
        </div>
      </div>

      <div className="border-b border-neutral-100 p-3">
        <div className="relative w-full sm:max-w-xs">
          <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trainee or batch..."
            className="h-9 w-full rounded-md border border-neutral-200 pl-8 pr-2.5 text-sm transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="divide-y divide-neutral-100">
        {incomplete.map((t) => {
          const allowed = !!t.evaluationAccessOverride
          return (
            <div key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{t.name}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-neutral-500">
                  <FileWarning size={11} className="text-warning-600" />
                  {t.batchNo} &middot; missing {t.missingDocuments?.length ?? 0} document{(t.missingDocuments?.length ?? 0) === 1 ? '' : 's'}
                </p>
              </div>
              <button
                role="switch"
                aria-checked={allowed}
                onClick={() => toggle(t.id, !allowed, t.name)}
                className={cn(
                  'relative h-6 w-11 shrink-0 rounded-pill transition-colors',
                  allowed ? 'bg-brand-500' : 'bg-neutral-200',
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-card transition-transform',
                    allowed ? 'translate-x-[22px]' : 'translate-x-0.5',
                  )}
                />
              </button>
            </div>
          )
        })}
        {incomplete.length === 0 && (
          <div className="px-4 py-8 text-center text-xs text-neutral-400">
            No trainees with incomplete documents match your search.
          </div>
        )}
      </div>
    </div>
  )
}
