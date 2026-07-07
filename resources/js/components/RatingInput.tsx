import { cn } from '@/lib/utils'

interface RatingInputProps {
  value: number
  onChange?: (value: number) => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

/**
 * Numeric 1–100 rating control used for Task Ratings. Read-only (plain
 * number display) when `onChange` isn't provided.
 */
export function RatingInput({ value, onChange, disabled, size = 'md' }: RatingInputProps) {
  const interactive = !!onChange && !disabled

  if (!interactive) {
    return (
      <span className={cn('font-semibold text-ink', size === 'sm' ? 'text-xs' : 'text-sm')}>
        {value ? Math.round(value) : '—'}
        <span className="ml-0.5 font-normal text-neutral-400">/100</span>
      </span>
    )
  }

  function handleChange(raw: string) {
    if (raw === '') {
      onChange!(0)
      return
    }
    const num = Number(raw)
    if (Number.isNaN(num)) return
    onChange!(Math.max(0, Math.min(100, Math.round(num))))
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={1}
        max={100}
        step={1}
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="1–100"
        className="h-9 w-20 rounded-md border border-neutral-200 bg-white px-2.5 text-sm text-ink placeholder:text-neutral-400 transition-colors hover:border-neutral-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
      />
      <span className="text-xs text-neutral-400">/ 100</span>
    </div>
  )
}
