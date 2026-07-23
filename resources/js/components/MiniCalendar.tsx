import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import type { CalendarEvent } from '@/types/modules/dashboard/calendar-event';
import { cn } from '@/lib/utils';
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];
const TYPE_DOT: Record<CalendarEvent['type'], string> = {
    batch: 'bg-brand-500',
    evaluation: 'bg-warning-400',
    meeting: 'bg-success-400',
    holiday: 'bg-danger-400',
    leave: 'bg-orange-400',
    task: 'bg-violet-400',
};
function toKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
export function MiniCalendar({
    events,
    initialDate,
    onMonthChange,
    onSelectDate,
}: {
    events: CalendarEvent[];
    initialDate: Date;
    /** Fired after the user navigates to a different month, so callers can refetch that month's events. */
    onMonthChange?: (year: number, month: number) => void;
    /**
     * When provided, a date click reports the day's events here instead of
     * growing the calendar card with an inline list — lets the caller show
     * them in a modal so this card's height stays fixed among grid siblings.
     */
    onSelectDate?: (dateKey: string, events: CalendarEvent[]) => void;
}) {
    const [cursor, setCursor] = useState(
        new Date(initialDate.getFullYear(), initialDate.getMonth(), 1),
    );
    const [selectedKey, setSelectedKey] = useState<string | null>(
        toKey(
            initialDate.getFullYear(),
            initialDate.getMonth(),
            initialDate.getDate(),
        ),
    );
    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        for (const ev of events) {
            const list = map.get(ev.date) ?? [];
            list.push(ev);
            map.set(ev.date, list);
        }
        return map;
    }, [events]);
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [
        ...Array.from(
            {
                length: firstWeekday,
            },
            () => null,
        ),
        ...Array.from(
            {
                length: daysInMonth,
            },
            (_, i) => i + 1,
        ),
    ];
    while (cells.length % 7 !== 0) cells.push(null);
    const selectedEvents = selectedKey
        ? (eventsByDate.get(selectedKey) ?? [])
        : [];
    const todayKey = toKey(
        initialDate.getFullYear(),
        initialDate.getMonth(),
        initialDate.getDate(),
    );
    return (
        <div
            className="h-full rounded-lg border border-neutral-200 bg-white p-3.5"
            data-cy="dashboard-calendar-widget"
        >
            <div
                className="mb-3 flex items-center justify-between"
                data-cy="mini-calendar-div-2"
            >
                <h2
                    className="flex items-center gap-1.5 text-sm font-semibold text-ink"
                    data-cy="mini-calendar-h2-3"
                >
                    <CalendarDays
                        size={15}
                        className="text-neutral-400"
                        data-cy="mini-calendar-calendar-days-4"
                    />
                    {MONTH_NAMES[month]} {year}
                </h2>
                <div className="flex gap-1" data-cy="mini-calendar-div-5">
                    <button
                        onClick={() => {
                            const next = new Date(year, month - 1, 1);
                            setCursor(next);
                            onMonthChange?.(
                                next.getFullYear(),
                                next.getMonth(),
                            );
                        }}
                        aria-label="Previous month"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                        data-cy="mini-calendar-button-previous-month"
                    >
                        <ChevronLeft
                            size={13}
                            data-cy="mini-calendar-chevron-left-7"
                        />
                    </button>
                    <button
                        onClick={() => {
                            const next = new Date(year, month + 1, 1);
                            setCursor(next);
                            onMonthChange?.(
                                next.getFullYear(),
                                next.getMonth(),
                            );
                        }}
                        aria-label="Next month"
                        className="flex h-6 w-6 items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                        data-cy="mini-calendar-button-next-month"
                    >
                        <ChevronRight
                            size={13}
                            data-cy="mini-calendar-chevron-right-9"
                        />
                    </button>
                </div>
            </div>

            <div
                className="grid grid-cols-7 gap-y-1 text-center"
                data-cy="mini-calendar-div-10"
            >
                {WEEKDAYS.map((w, i) => (
                    <div
                        key={i}
                        className="text-[10px] font-medium text-neutral-400"
                        data-cy="mini-calendar-div-11"
                    >
                        {w}
                    </div>
                ))}
                {cells.map((day, i) => {
                    if (day === null)
                        return <div key={i} data-cy="mini-calendar-div-12" />;
                    const key = toKey(year, month, day);
                    const dayEvents = eventsByDate.get(key) ?? [];
                    const isSelected = key === selectedKey;
                    const isToday = key === todayKey;
                    return (
                        <button
                            key={i}
                            onClick={() => {
                                setSelectedKey(key);
                                onSelectDate?.(key, dayEvents);
                            }}
                            className={cn(
                                'relative mx-auto flex h-7 w-7 flex-col items-center justify-center rounded-md text-xs font-medium transition-colors',
                                isSelected
                                    ? 'bg-brand-500 text-white'
                                    : isToday
                                      ? 'bg-brand-50 text-brand-700'
                                      : 'text-neutral-600 hover:bg-neutral-100',
                            )}
                            data-cy="calendar-date-cell"
                        >
                            {day}
                            {dayEvents.length > 0 && (
                                <span
                                    className="mt-0.5 flex gap-0.5"
                                    data-cy="mini-calendar-span-14"
                                >
                                    {dayEvents.slice(0, 3).map((ev, idx) => (
                                        <span
                                            key={idx}
                                            className={cn(
                                                'h-1 w-1 rounded-full',
                                                isSelected
                                                    ? 'bg-white'
                                                    : TYPE_DOT[ev.type],
                                            )}
                                            data-cy="calendar-event-dot"
                                        />
                                    ))}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {!onSelectDate && (
                <div
                    className="mt-3 border-t border-neutral-100 pt-3"
                    data-cy="event-detail-popover"
                >
                    {selectedEvents.length > 0 ? (
                        <ul
                            className="flex flex-col gap-2"
                            data-cy="mini-calendar-ul-17"
                        >
                            {selectedEvents.map((ev) => (
                                <li
                                    key={ev.id}
                                    className="flex items-start gap-2 text-xs"
                                    data-cy="mini-calendar-li-18"
                                >
                                    <span
                                        className={cn(
                                            'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                                            TYPE_DOT[ev.type],
                                        )}
                                        data-cy="mini-calendar-span-19"
                                    />
                                    <span
                                        className="text-neutral-700"
                                        data-cy="mini-calendar-span-20"
                                    >
                                        {ev.title}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p
                            className="text-xs text-neutral-400"
                            data-cy="mini-calendar-p-21"
                        >
                            {selectedKey
                                ? 'No schedules or events on this date.'
                                : 'Select a date to view schedules or events.'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
