/**
 * @file api-service-layer/trainee/announcements.ts
 * Trainee announcements — dashboard widget preview (`markRead`) and the full
 * feed page (`list`) at `/trainee/announcements`.
 */

import { http, unwrap } from '../client';
import type { DashboardAnnouncement } from '@/types/modules/dashboard/trainee-dashboard';

export interface TraineeAnnouncementsPage {
    data: DashboardAnnouncement[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export const traineeAnnouncementsService = {
    /** GET /trainee/announcements-data */
    list: async (params?: { page?: number; per_page?: number }): Promise<TraineeAnnouncementsPage> => {
        const usable = Object.entries(params ?? {}).filter(([, v]) => v !== undefined) as [string, number][];
        const qs = usable.length > 0 ? `?${new URLSearchParams(usable.map(([k, v]) => [k, String(v)])).toString()}` : '';
        return unwrap<TraineeAnnouncementsPage>(await http.get(`/trainee/announcements-data${qs}`));
    },

    markRead: async (announcementId: string | number): Promise<void> => {
        await http.post(`/trainee/announcements/${announcementId}/read`);
    },
};
