interface Segment {
  label: string
  value: number
  color: string // hex, matching tailwind.config.js palette e.g. '#2176E3'
}

export function DonutChart({ segments, centerLabel, centerValue }: { segments: Segment[]; centerLabel: string; centerValue: string | number }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-28 w-28 shrink-0 -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#EEF1F4" strokeWidth="12" />
        {segments.map((seg, i) => {
          const fraction = seg.value / total
          const dash = fraction * circumference
          const el = (
            <circle
              key={i}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth="12"
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              className="transition-all duration-500"
            />
          )
          offset += dash
          return el
        })}
      </svg>
      <div className="flex-1">
        <div className="text-2xl font-semibold text-ink">{centerValue}</div>
        <div className="mb-2 text-xs text-neutral-500">{centerLabel}</div>
        <ul className="flex flex-col gap-1">
          {segments.map((seg, i) => (
            <li key={i} className="flex items-center gap-1.5 text-xs text-neutral-600">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              {seg.label} <span className="ml-auto font-medium text-ink">{seg.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
