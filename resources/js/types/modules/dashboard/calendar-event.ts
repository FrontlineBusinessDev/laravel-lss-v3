/**
 * @file types/modules/dashboard/calendar-event.ts
 * Shared calendar-event shape used by both the admin and trainer dashboard
 * widgets (see adminDashboardService.getCalendarEvents / MiniCalendar).
 */
export interface CalendarEvent {
    id: string;
    date: string; // YYYY-MM-DD
    title: string;
    type: 'batch' | 'evaluation' | 'holiday' | 'meeting' | 'leave' | 'task';
}
