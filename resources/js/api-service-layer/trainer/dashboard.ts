/**
 * @file api-service-layer/trainer/dashboard.ts
 * Trainer Dashboard widgets — `/trainer/dashboard/*`. Each function backs one
 * self-contained widget component; none of this data arrives via Inertia
 * props (see resources/js/pages/trainer/dashboard/index.tsx).
 */

import type { CalendarEvent } from '@/types/modules/dashboard/calendar-event';
import type {
    DashboardAnnouncement,
    DashboardMetrics,
    DocumentComplianceRow,
    OnLeaveTrainee,
    OngoingTasksResponse,
    UpcomingBatchEnd,
} from '@/types/modules/dashboard/trainer-dashboard';
import { http, unwrap } from '../client';

export const trainerDashboardService = {
    getDashboardMetrics: async (): Promise<DashboardMetrics> =>
        unwrap(await http.get('/trainer/dashboard/metrics')),

    getUpcomingEnds: async (): Promise<UpcomingBatchEnd[]> =>
        unwrap(await http.get('/trainer/dashboard/upcoming-ends')),

    /** `month` in `Y-m` format, e.g. "2026-07". */
    getCalendarEvents: async (month: string): Promise<CalendarEvent[]> =>
        unwrap(
            await http.get('/trainer/dashboard/calendar-events', {
                params: { month },
            }),
        ),

    getOnLeaveTrainees: async (): Promise<OnLeaveTrainee[]> =>
        unwrap(await http.get('/trainer/dashboard/on-leave')),

    getOngoingTasks: async (): Promise<OngoingTasksResponse> =>
        unwrap(await http.get('/trainer/dashboard/ongoing-tasks')),

    getAnnouncements: async (): Promise<DashboardAnnouncement[]> =>
        unwrap(await http.get('/trainer/dashboard/announcements')),

    getDocumentPendingTrainees: async (): Promise<DocumentComplianceRow[]> =>
        unwrap(await http.get('/trainer/dashboard/document-compliance')),
};
