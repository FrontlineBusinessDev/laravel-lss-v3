import { useState } from 'react'
import { Eye, EyeOff, Banknote } from 'lucide-react'

function formatPHP(amount: number) {
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function EarningsCard({ amount }: { amount: number }) {
  const [visible, setVisible] = useState(true)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3.5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-neutral-500">
          <Banknote size={14} className="text-neutral-400" />
          Total earnings
        </span>
        <button
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide amount' : 'Show amount'}
          className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
        >
          {visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
      </div>
      <div className="mt-1.5 text-2xl font-semibold text-ink">
        {visible ? formatPHP(amount) : '••••••••'}
      </div>
      <div className="mt-1 text-xs text-neutral-500">Trainee payments + seminar registration fees, year to date</div>
    </div>
  )
}
