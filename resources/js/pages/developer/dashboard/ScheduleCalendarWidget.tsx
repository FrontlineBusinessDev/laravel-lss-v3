import { useState } from 'react';
import { adminDashboardService } from '@/api-service-layer/admin/dashboard';
import { MiniCalendar } from '@/components/MiniCalendar';
import { ModalCenter } from '@/components/modal/ModalCenter';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';
import { DayEventsModal, type DayEventsModalData } from './DayEventsModal';

function toMonthKey(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * Thin wrapper around the shared MiniCalendar, refetching events whenever
 * the admin navigates to a different month. Dot indicators cover batch
 * projected-end dates, approved leave ranges, and task dates (see
 * DashboardController::calendarEvents()). Date clicks open a modal instead
 * of growing this card, so it never stretches its dashboard-row siblings.
 */
export function ScheduleCalendarWidget() {
    const today = new Date();
    const [monthKey, setMonthKey] = useState(() =>
        toMonthKey(today.getFullYear(), today.getMonth()),
    );
    const [dayModal, setDayModal] = useState<DayEventsModalData | null>(null);

    const { data, error } = useDashboardWidget(
        () => adminDashboardService.getCalendarEvents(monthKey),
        [monthKey],
    );

    return (
        <div>
            {error && (
                <p className="text-danger-700 mb-2 rounded-md bg-danger-50 px-2.5 py-1.5 text-xs">
                    {error}
                </p>
            )}
            <MiniCalendar
                events={data ?? []}
                initialDate={today}
                onMonthChange={(year, month) =>
                    setMonthKey(toMonthKey(year, month))
                }
                onSelectDate={(dateKey, events) =>
                    setDayModal({ dateKey, events })
                }
            />
            <ModalCenter<DayEventsModalData>
                show={dayModal !== null}
                onClose={() => setDayModal(null)}
                data={dayModal}
                size="sm"
                title={dayModal?.dateKey}
                ModalComponent={DayEventsModal}
            />
        </div>
    );
}
