/**
 * @file api-service-layer/trainee/announcements.ts
 * Trainee dashboard announcements — `/trainee/announcements`.
 */

import { http } from '../client';

export const traineeAnnouncementsService = {
    markRead: async (announcementId: string | number): Promise<void> => {
        await http.post(`/trainee/announcements/${announcementId}/read`);
    },
};
