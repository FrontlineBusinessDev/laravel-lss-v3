import { Star } from 'lucide-react'

export function RatingDistributionChart({ data }: { data: { score: number; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  const total = data.reduce((sum, d) => sum + d.count, 0)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <h2 className="mb-0.5 text-sm font-semibold text-ink">Rating distribution</h2>
      <p className="mb-4 text-xs text-neutral-500">{total} evaluation {total === 1 ? 'response' : 'responses'} across all categories</p>
      <div className="flex items-end gap-3 px-1">
        {[...data].reverse().map((d) => (
          <div key={d.score} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="text-[11px] font-semibold text-ink">{d.count}</span>
            <div className="flex h-28 w-full items-end">
              <div
                className="w-full rounded-t-sm bg-brand-500/85 transition-all"
                style={{ height: `${Math.max((d.count / max) * 100, d.count > 0 ? 4 : 0)}%` }}
              />
            </div>
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-neutral-500">
              {d.score} <Star size={9} className="fill-warning-400 text-warning-400" />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
