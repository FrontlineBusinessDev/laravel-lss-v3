import type { ModalComponentProps } from '@/components/modal/ModalCenter';
import type { CalendarEvent } from '@/types/modules/dashboard/calendar-event';
import { cn } from '@/lib/utils';

const TYPE_DOT: Record<CalendarEvent['type'], string> = {
  batch: 'bg-brand-500',
  evaluation: 'bg-warning-400',
  meeting: 'bg-success-400',
  holiday: 'bg-danger-400',
  leave: 'bg-orange-400',
  task: 'bg-violet-400',
};

export interface DayEventsModalData {
  dateKey: string;
  events: CalendarEvent[];
}

export function DayEventsModal({ data }: ModalComponentProps<DayEventsModalData>) {
  const events = data?.events ?? [];

  return (
    <div className="p-6" data-cy="day-events-modal-div-1">
      {events.length > 0 ? (
        <ul className="flex flex-col gap-3" data-cy="day-events-modal-ul-1">
          {events.map((ev) => (
            <li key={ev.id} className="flex items-start gap-2 text-sm" data-cy="day-events-modal-li-1">
              <span className={cn('mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full', TYPE_DOT[ev.type])} data-cy="day-events-modal-span-1" />
              <span className="text-neutral-700" data-cy="day-events-modal-span-2">{ev.title}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-neutral-400" data-cy="day-events-modal-p-1">No schedules or events on this date.</p>
      )}
    </div>
  );
}
