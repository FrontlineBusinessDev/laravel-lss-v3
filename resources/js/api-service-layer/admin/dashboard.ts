/**
 * @file api-service-layer/admin/dashboard.ts
 * Admin Dashboard widgets — `/dashboard/*`. Each function backs one
 * self-contained widget component; none of this data arrives via Inertia
 * props (see resources/js/pages/developer/dashboard/index.tsx).
 */

import type { CalendarEvent } from '@/types';
import type {
    AdminDashboardAnnouncement,
    AdminDashboardMetrics,
    DocumentComplianceRow,
    OnLeaveTrainee,
    OngoingTasksResponse,
    RecentBatch,
    TraineeGrowthPoint,
    TraineeStatusBreakdown,
    UpcomingBatchEnd,
} from '@/types/modules/dashboard/admin-dashboard';
import { http, unwrap } from '../client';

export const adminDashboardService = {
    getMetrics: async (): Promise<AdminDashboardMetrics> =>
        unwrap(await http.get('/dashboard/metrics')),

    getUpcomingEnds: async (): Promise<UpcomingBatchEnd[]> =>
        unwrap(await http.get('/dashboard/upcoming-ends')),

    /** `month` in `Y-m` format, e.g. "2026-07". */
    getCalendarEvents: async (month: string): Promise<CalendarEvent[]> =>
        unwrap(
            await http.get('/dashboard/calendar-events', {
                params: { month },
            }),
        ),

    getOnLeaveTrainees: async (): Promise<OnLeaveTrainee[]> =>
        unwrap(await http.get('/dashboard/on-leave')),

    getOngoingTasks: async (): Promise<OngoingTasksResponse> =>
        unwrap(await http.get('/dashboard/ongoing-tasks')),

    getAnnouncements: async (): Promise<AdminDashboardAnnouncement[]> =>
        unwrap(await http.get('/dashboard/announcements')),

    getDocumentPendingTrainees: async (): Promise<DocumentComplianceRow[]> =>
        unwrap(await http.get('/dashboard/document-compliance')),

    getTraineeGrowth: async (): Promise<TraineeGrowthPoint[]> =>
        unwrap(await http.get('/dashboard/trainee-growth')),

    getStatusBreakdown: async (): Promise<TraineeStatusBreakdown> =>
        unwrap(await http.get('/dashboard/status-breakdown')),

    getRecentBatches: async (): Promise<RecentBatch[]> =>
        unwrap(await http.get('/dashboard/recent-batches')),
};
