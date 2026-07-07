import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  value: number
  onChange?: (value: number) => void
  disabled?: boolean
  size?: number
  showValue?: boolean
}

/**
 * Shared 1–5 star rating control used across the Ratings module (Task Rating
 * and Behavioral Rating) so evaluators get one consistent input pattern.
 * Read-only when `onChange` isn't provided.
 */
export function RatingStars({ value, onChange, disabled, size = 20, showValue = true }: RatingStarsProps) {
  const [hover, setHover] = useState<number | null>(null)
  const interactive = !!onChange && !disabled
  const display = hover ?? value

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(null)}>
      {[1, 2, 3, 4, 5].map((i) =>
        interactive ? (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${i} out of 5`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange!(i)}
            className="p-0.5"
          >
            <Star
              size={size}
              className={cn(
                'transition-colors',
                i <= display ? 'fill-warning-400 text-warning-400' : 'text-neutral-200',
                'hover:text-warning-400',
              )}
            />
          </button>
        ) : (
          <Star
            key={i}
            size={size}
            className={cn(i <= display ? 'fill-warning-400 text-warning-400' : 'text-neutral-200')}
          />
        ),
      )}
      {showValue && <span className="ml-1.5 text-xs font-medium text-neutral-500">{value ? value.toFixed(1) : '—'}</span>}
    </div>
  )
}
