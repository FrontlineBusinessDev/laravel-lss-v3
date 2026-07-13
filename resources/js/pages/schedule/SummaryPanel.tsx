import { useMemo, useState } from 'react';
import { GraduationCap, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScheduleEntry } from './scheduleUtils';
import { getSchoolColor } from './scheduleUtils';
type GroupTab = 'school' | 'program';
export function SummaryPanel({
  entries
}: {
  entries: ScheduleEntry[];
}) {
  const [tab, setTab] = useState<GroupTab>('school');
  const activeEntries = useMemo(() => entries.filter(e => e.status === 'active'), [entries]);
  const bySchool = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of activeEntries) {
      for (const {
        school,
        count
      } of e.schoolCounts) {
        map.set(school, (map.get(school) ?? 0) + count);
      }
    }
    return Array.from(map.entries()).map(([school, count]) => ({
      label: school,
      count
    })).sort((a, b) => b.count - a.count);
  }, [activeEntries]);
  const byProgram = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of activeEntries) {
      for (const p of e.programs) {
        const traineesInProgram = e.trainees.filter(t => t.academicProgram === p).length;
        map.set(p, (map.get(p) ?? 0) + traineesInProgram);
      }
    }
    return Array.from(map.entries()).map(([program, count]) => ({
      label: program,
      count
    })).sort((a, b) => b.count - a.count);
  }, [activeEntries]);
  const rows = tab === 'school' ? bySchool : byProgram;
  const maxCount = Math.max(1, ...rows.map(r => r.count));
  return <div className="rounded-lg border border-neutral-200 bg-white p-4" data-cy="summary-panel-div-1">
      <div className="mb-3 flex items-center justify-between" data-cy="summary-panel-div-2">
        <h2 className="text-sm font-semibold text-ink" data-cy="summary-panel-h2-active-schedules-summary">Active schedules summary</h2>
        <div className="flex rounded-md border border-neutral-200 p-0.5" data-cy="summary-panel-div-4">
          <button onClick={() => setTab('school')} className={cn('flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors', tab === 'school' ? 'bg-brand-500 text-white' : 'text-neutral-500 hover:bg-neutral-100')} data-cy="summary-panel-button-set-tab">
            <GraduationCap size={11} data-cy="summary-panel-graduation-cap-6" /> By school
          </button>
          <button onClick={() => setTab('program')} className={cn('flex items-center gap-1 rounded-sm px-2 py-1 text-[11px] font-medium transition-colors', tab === 'program' ? 'bg-brand-500 text-white' : 'text-neutral-500 hover:bg-neutral-100')} data-cy="summary-panel-button-set-tab-2">
            <LayoutGrid size={11} data-cy="summary-panel-layout-grid-8" /> By program
          </button>
        </div>
      </div>

      {rows.length === 0 ? <p className="py-6 text-center text-xs text-neutral-400" data-cy="summary-panel-p-no-active-schedules-to-summarize">No active schedules to summarize.</p> : <ul className="flex flex-col gap-2.5" data-cy="summary-panel-ul-10">
          {rows.map(r => {
        const color = tab === 'school' ? getSchoolColor(r.label) : null;
        return <li key={r.label} data-cy="summary-panel-li-11">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs" data-cy="summary-panel-div-12">
                  <span className="flex min-w-0 items-center gap-1.5 truncate font-medium text-neutral-700" data-cy="summary-panel-span-13">
                    {color && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{
                backgroundColor: color.solid
              }} data-cy="summary-panel-span-14" />}
                    <span className="truncate" data-cy="summary-panel-span-15">{r.label}</span>
                  </span>
                  <span className="shrink-0 text-neutral-500" data-cy="summary-panel-span-trainees">{r.count} trainees</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-pill bg-neutral-100" data-cy="summary-panel-div-17">
                  <div className="h-full rounded-pill transition-all" style={{
              width: `${r.count / maxCount * 100}%`,
              backgroundColor: color ? color.solid : '#2176E3'
            }} data-cy="summary-panel-div-18" />
                </div>
              </li>;
      })}
        </ul>}
    </div>;
}