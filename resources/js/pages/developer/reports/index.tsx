import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AnnualTab } from './AnnualTab'
import { BatchTab } from './BatchTab'

const TABS = ['Annual', 'Batch'] as const

export default function ReportsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>('Annual')

  return (
    <div>
      <div className="mb-4 no-print">
        <h1 className="text-xl font-semibold text-ink">Reports</h1>
        <p className="text-sm text-neutral-500">Annual and per-batch training summaries, activities, and financial totals</p>
      </div>

      <div className="mb-4 flex gap-5 border-b border-neutral-200 pl-0.5 no-print">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'pb-2.5 text-xs font-medium transition-colors',
              tab === t ? 'border-b-2 border-brand-500 text-ink font-semibold' : 'text-neutral-500 hover:text-neutral-700',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Annual' && <AnnualTab />}
      {tab === 'Batch' && <BatchTab />}
    </div>
  )
}
