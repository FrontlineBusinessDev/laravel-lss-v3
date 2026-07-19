/**
 * @file api-service-layer/notification.ts
 * Polled in-app notification feed — `/notifications` (not a crudModule
 * resource; bespoke list/markRead/markAllRead per NotificationController).
 */

import { http, unwrap } from './client';

export interface NotificationRow {
    id: number;
    user_id: number;
    type: string;
    title: string;
    body: string | null;
    data: Record<string, unknown> | null;
    read_at: string | null;
    created_at: string;
    updated_at: string;
}

export const notificationService = {
    list: async (): Promise<{ data: NotificationRow[]; unread_count: number }> => {
        const res = await http.get('/notifications');

        return {
            data: res.data.data as NotificationRow[],
            unread_count: res.data.unread_count as number,
        };
    },

    markRead: async (id: number): Promise<NotificationRow> =>
        unwrap<NotificationRow>(await http.patch(`/notifications/${id}/read`)),

    markAllRead: async (): Promise<void> => {
        await http.patch('/notifications/read-all');
    },
};
