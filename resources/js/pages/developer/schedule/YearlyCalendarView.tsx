import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScheduleEntry } from './scheduleUtils';
import { buildDayCoverageIndex, getSchoolColor, toKey } from './scheduleUtils';
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function MiniMonth({
  year,
  month,
  index,
  selectedKey,
  onSelectDay
}: {
  year: number;
  month: number;
  index: Map<string, ScheduleEntry[]>;
  selectedKey: string | null;
  onSelectDay: (key: string) => void;
}) {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [...Array.from({
    length: firstWeekday
  }, () => null), ...Array.from({
    length: daysInMonth
  }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return <div className="rounded-lg border border-neutral-200 p-2.5" data-cy="yearly-calendar-view-div-1">
      <h3 className="mb-1.5 text-xs font-semibold text-ink" data-cy="yearly-calendar-view-h3-2">{MONTH_NAMES[month]}</h3>
      <div className="grid grid-cols-7 gap-y-0.5 text-center" data-cy="yearly-calendar-view-div-3">
        {WEEKDAYS.map((w, i) => <div key={i} className="text-[9px] font-medium text-neutral-400" data-cy="yearly-calendar-view-div-4">
            {w}
          </div>)}
        {cells.map((day, i) => {
        if (day === null) return <div key={i} data-cy="yearly-calendar-view-div-5" />;
        const key = toKey(year, month, day);
        const dayEntries = index.get(key) ?? [];
        const isSelected = key === selectedKey;
        return <button key={i} onClick={() => onSelectDay(key)} disabled={dayEntries.length === 0} className={cn('relative mx-auto flex h-5 w-5 flex-col items-center justify-center rounded-sm text-[10px] font-medium transition-colors', isSelected ? 'bg-brand-500 text-white' : dayEntries.length > 0 ? 'text-neutral-700 hover:bg-neutral-100' : 'text-neutral-300')} data-cy="yearly-calendar-view-button-select-day">
              {day}
              {dayEntries.length > 0 && <span className="absolute -bottom-0.5 flex gap-0.5" data-cy="yearly-calendar-view-span-7">
                  {dayEntries.slice(0, 3).map((e, idx) => <span key={idx} className="h-[3px] w-[3px] rounded-full" style={{
              backgroundColor: isSelected ? '#fff' : getSchoolColor(e.primarySchool).solid
            }} data-cy="yearly-calendar-view-span-8" />)}
                </span>}
            </button>;
      })}
      </div>
    </div>;
}
export function YearlyCalendarView({
  entries,
  year,
  onYearChange,
  onSelect
}: {
  entries: ScheduleEntry[];
  year: number;
  onYearChange: (y: number) => void;
  onSelect: (entry: ScheduleEntry) => void;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const index = useMemo(() => buildDayCoverageIndex(entries, year), [entries, year]);
  const selectedEntries = selectedKey ? index.get(selectedKey) ?? [] : [];
  return <div className="rounded-lg border border-neutral-200 bg-white p-3.5" data-cy="yearly-calendar-view-div-9">
      <div className="mb-3 flex items-center justify-between" data-cy="yearly-calendar-view-div-10">
        <h2 className="text-sm font-semibold text-ink" data-cy="yearly-calendar-view-h2-yearly-calendar">Yearly calendar</h2>
        <div className="flex items-center gap-1" data-cy="yearly-calendar-view-div-12">
          <button onClick={() => onYearChange(year - 1)} aria-label="Previous year" className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" data-cy="yearly-calendar-view-button-previous-year">
            <ChevronLeft size={14} data-cy="yearly-calendar-view-chevron-left-14" />
          </button>
          <span className="w-12 text-center text-sm font-semibold text-ink" data-cy="yearly-calendar-view-span-15">{year}</span>
          <button onClick={() => onYearChange(year + 1)} aria-label="Next year" className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600" data-cy="yearly-calendar-view-button-next-year">
            <ChevronRight size={14} data-cy="yearly-calendar-view-chevron-right-17" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4" data-cy="yearly-calendar-view-div-18">
        {Array.from({
        length: 12
      }, (_, m) => <MiniMonth key={m} year={year} month={m} index={index} selectedKey={selectedKey} onSelectDay={setSelectedKey} data-cy="yearly-calendar-view-mini-month-19" />)}
      </div>

      <div className="mt-4 border-t border-neutral-100 pt-3" data-cy="yearly-calendar-view-div-20">
        <h3 className="mb-2 text-xs font-semibold text-neutral-600" data-cy="yearly-calendar-view-h3-21">
          {selectedKey ? `Schedules active on ${selectedKey}` : 'Select a highlighted day to view its schedules'}
        </h3>
        {selectedEntries.length > 0 ? <ul className="flex flex-col gap-1.5" data-cy="yearly-calendar-view-ul-22">
            {selectedEntries.map(e => {
          const color = getSchoolColor(e.primarySchool);
          return <li key={e.batch.id} data-cy="yearly-calendar-view-li-23">
                  <button onClick={() => onSelect(e)} className="flex w-full items-center gap-2 rounded-md border border-neutral-200 px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-neutral-50" data-cy="yearly-calendar-view-button-select">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{
                backgroundColor: color.solid
              }} data-cy="yearly-calendar-view-span-25" />
                    <span className="font-mono font-medium text-ink" data-cy="yearly-calendar-view-span-26">{e.batch.batchNo}</span>
                    <span className="truncate text-neutral-500" data-cy="yearly-calendar-view-span-27">
                      {e.batch.programType} · {e.primarySchool}
                    </span>
                  </button>
                </li>;
        })}
          </ul> : <p className="text-xs text-neutral-400" data-cy="yearly-calendar-view-p-no-schedules-on-this-date">No schedules on this date.</p>}
      </div>
    </div>;
}