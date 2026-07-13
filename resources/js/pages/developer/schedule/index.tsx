import { useMemo, useState } from 'react'
import { CalendarDays, GanttChartSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBatches } from '@/context/BatchesContext'
import { partnerSchools } from '@/data/mockData'
import { ScheduleFilters, EMPTY_FILTERS, type ScheduleFilterState } from './ScheduleFilters'
import { SummaryPanel } from './SummaryPanel'
import { YearlyTimeline } from './YearlyTimeline'
import { YearlyCalendarView } from './YearlyCalendarView'
import { ScheduleEntryModal } from './ScheduleEntryModal'
import { buildScheduleEntries, getSchoolColor, type ScheduleEntry } from './scheduleUtils'

type ViewMode = 'timeline' | 'calendar'

export default function SchedulePage() {
  const { batches, trainees } = useBatches()
  const [view, setView] = useState<ViewMode>('timeline')
  const [year, setYear] = useState(() => new Date().getFullYear())
  const [filters, setFilters] = useState<ScheduleFilterState>(EMPTY_FILTERS)
  const [selected, setSelected] = useState<ScheduleEntry | null>(null)

  const allEntries = useMemo(() => buildScheduleEntries(batches, trainees), [batches, trainees])

  const filterOptions = useMemo(() => {
    const schools = new Set<string>(partnerSchools.filter((s) => s.status === 'active').map((s) => s.name))
    const programs = new Set<string>()
    const industries = new Set<string>()
    const statuses = new Set<string>()
    const batchNos = new Set<string>()
    for (const e of allEntries) {
      batchNos.add(e.batch.batchNo)
      industries.add(e.batch.industry)
      statuses.add(e.batch.status)
      for (const p of e.programs) programs.add(p)
      for (const { school } of e.schoolCounts) schools.add(school)
    }
    return {
      schools: Array.from(schools).sort(),
      programs: Array.from(programs).sort(),
      industries: Array.from(industries).sort(),
      statuses: Array.from(statuses).sort(),
      batches: Array.from(batchNos).sort(),
    }
  }, [allEntries])

  const filteredEntries = useMemo(() => {
    return allEntries.filter((e) => {
      if (filters.schools.length && !e.schoolCounts.some((s) => filters.schools.includes(s.school))) return false
      if (filters.programs.length && !e.programs.some((p) => filters.programs.includes(p))) return false
      if (filters.batches.length && !filters.batches.includes(e.batch.batchNo)) return false
      if (filters.industries.length && !filters.industries.includes(e.batch.industry)) return false
      if (filters.statuses.length && !filters.statuses.includes(e.batch.status)) return false
      return true
    })
  }, [allEntries, filters])

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Schedule</h1>
          <p className="text-sm text-neutral-500">
            {filteredEntries.length} of {allEntries.length} training schedules · batch timelines &amp; calendar
          </p>
        </div>
        <div className="flex rounded-md border border-neutral-200 bg-white p-0.5">
          <button
            onClick={() => setView('timeline')}
            className={cn(
              'flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors',
              view === 'timeline' ? 'bg-brand-500 text-white' : 'text-neutral-500 hover:bg-neutral-100',
            )}
          >
            <GanttChartSquare size={13} /> Timeline
          </button>
          <button
            onClick={() => setView('calendar')}
            className={cn(
              'flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-xs font-medium transition-colors',
              view === 'calendar' ? 'bg-brand-500 text-white' : 'text-neutral-500 hover:bg-neutral-100',
            )}
          >
            <CalendarDays size={13} /> Calendar
          </button>
        </div>
      </div>

      <ScheduleFilters filters={filters} onChange={setFilters} options={filterOptions} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          {view === 'timeline' ? (
            <YearlyTimeline entries={filteredEntries} year={year} onYearChange={setYear} onSelect={setSelected} />
          ) : (
            <YearlyCalendarView entries={filteredEntries} year={year} onYearChange={setYear} onSelect={setSelected} />
          )}

          {/* School color legend */}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-lg border border-neutral-200 bg-white p-3">
            <span className="text-[11px] font-medium text-neutral-500">School color key:</span>
            {filterOptions.schools.map((school) => {
              const color = getSchoolColor(school)
              return (
                <span key={school} className="flex items-center gap-1 text-[11px] text-neutral-600">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.solid }} />
                  {school}
                </span>
              )
            })}
          </div>
        </div>

        <div className="lg:sticky lg:top-4 lg:self-start">
          <SummaryPanel entries={filteredEntries} />
        </div>
      </div>

      <ScheduleEntryModal entry={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
