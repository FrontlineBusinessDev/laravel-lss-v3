import { ChevronLeft, ChevronRight, Users } from 'lucide-react'
import { StatusBadge } from '@/components/StatusBadge'
import type { ScheduleEntry } from './scheduleUtils'
import { dayOfYear, daysInYear, formatShortDate, getSchoolColor } from './scheduleUtils'

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function YearlyTimeline({
  entries,
  year,
  onYearChange,
  onSelect,
}: {
  entries: ScheduleEntry[]
  year: number
  onYearChange: (y: number) => void
  onSelect: (entry: ScheduleEntry) => void
}) {
  const yearStart = new Date(year, 0, 1)
  const yearEnd = new Date(year, 11, 31)
  const totalDays = daysInYear(year)

  const visible = entries.filter((e) => e.end >= yearStart && e.start <= yearEnd)

  return (
    <div className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between border-b border-neutral-200 p-3.5">
        <h2 className="text-sm font-semibold text-ink">Yearly batch timeline</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onYearChange(year - 1)}
            aria-label="Previous year"
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="w-12 text-center text-sm font-semibold text-ink">{year}</span>
          <button
            onClick={() => onYearChange(year + 1)}
            aria-label="Next year"
            className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Desktop / tablet Gantt */}
      <div className="hidden overflow-x-auto sm:block lss-scrollbar">
        <div className="min-w-[860px] p-3.5">
          {/* Month header */}
          <div className="mb-2 grid grid-cols-12 border-b border-neutral-100 pb-2 pl-44">
            {MONTH_LABELS.map((m) => (
              <div key={m} className="text-center text-[11px] font-medium text-neutral-400">
                {m}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            {visible.map((entry) => {
              const color = getSchoolColor(entry.primarySchool)
              const rangeStart = entry.start < yearStart ? yearStart : entry.start
              const rangeEnd = entry.end > yearEnd ? yearEnd : entry.end
              const leftPct = (dayOfYear(rangeStart) / totalDays) * 100
              const widthPct = Math.max(1.5, ((dayOfYear(rangeEnd) - dayOfYear(rangeStart)) / totalDays) * 100)

              return (
                <div key={entry.batch.id} className="flex items-center gap-2">
                  <div className="w-44 shrink-0 pr-2">
                    <div className="truncate font-mono text-xs font-medium text-ink">{entry.batch.batchNo}</div>
                    <div className="truncate text-[11px] text-neutral-400">{entry.batch.programType}</div>
                  </div>
                  <div className="relative h-8 flex-1 rounded-sm bg-neutral-50">
                    <button
                      onClick={() => onSelect(entry)}
                      title={`${entry.batch.batchNo} · ${formatShortDate(entry.start)} – ${formatShortDate(entry.end)}`}
                      className="group absolute top-1/2 flex h-5 -translate-y-1/2 items-center gap-1.5 rounded-pill px-2 text-[11px] font-medium shadow-card transition-all hover:h-6 hover:shadow-popover"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        minWidth: '28px',
                        backgroundColor: color.bg,
                        color: color.text,
                        border: `1px solid ${color.border}`,
                      }}
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color.solid }} />
                      <span className="truncate">{entry.trainees.length || entry.batch.trainees}</span>
                    </button>
                  </div>
                </div>
              )
            })}
            {visible.length === 0 && (
              <div className="py-10 text-center text-sm text-neutral-400">No schedules match your filters for {year}.</div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-2 p-3 sm:hidden">
        {visible.map((entry) => {
          const color = getSchoolColor(entry.primarySchool)
          return (
            <button
              key={entry.batch.id}
              onClick={() => onSelect(entry)}
              className="rounded-lg border border-neutral-200 p-3 text-left transition-colors active:bg-neutral-50"
              style={{ borderLeft: `3px solid ${color.solid}` }}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-mono text-sm font-semibold text-ink">{entry.batch.batchNo}</span>
                <StatusBadge status={entry.batch.status} />
              </div>
              <p className="text-xs text-neutral-500">{entry.batch.programType}</p>
              <div className="mt-1.5 flex items-center justify-between text-xs text-neutral-500">
                <span>
                  {formatShortDate(entry.start)} &ndash; {formatShortDate(entry.end)}
                </span>
                <span className="flex items-center gap-1">
                  <Users size={12} />
                  {entry.trainees.length || entry.batch.trainees}
                </span>
              </div>
            </button>
          )
        })}
        {visible.length === 0 && (
          <div className="rounded-lg border border-dashed border-neutral-200 py-8 text-center text-sm text-neutral-400">
            No schedules match your filters for {year}.
          </div>
        )}
      </div>
    </div>
  )
}
