import { useState } from 'react';
import { trainerDashboardService } from '@/api-service-layer/trainer/dashboard';
import { MiniCalendar } from '@/components/MiniCalendar';
import { useDashboardWidget } from '@/hooks/use-dashboard-widget';

function toMonthKey(year: number, month: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * Thin wrapper around the shared MiniCalendar, refetching events whenever
 * the trainer navigates to a different month. Dot indicators cover batch
 * projected-end dates, approved leave ranges, and task dates (see
 * DashboardController::calendarEvents()).
 */
export function ScheduleCalendarWidget() {
    const today = new Date();
    const [monthKey, setMonthKey] = useState(() =>
        toMonthKey(today.getFullYear(), today.getMonth()),
    );

    const { data, error } = useDashboardWidget(
        () => trainerDashboardService.getCalendarEvents(monthKey),
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
            />
        </div>
    );
}
