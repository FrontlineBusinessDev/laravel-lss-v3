/**
 * @file types/modules/notifications/notification.ts
 * In-app notification shape used by NotificationsContext, backed by the real
 * `notificationService` (`/notifications`).
 */
export type NotificationAudience = 'admin' | 'trainee';

/**
 * In-app notification. Admin notifications back the notification bell;
 * trainee notifications are recorded for completeness even though this
 * admin console has no trainee-facing surface to render them in.
 */
export interface AppNotification {
    id: string;
    audience: NotificationAudience;
    title: string;
    body: string;
    createdAt: string; // ISO date
    read: boolean;
    link?: string;
    relatedLeaveId?: string;
    type?: string;
    data?: Record<string, unknown> | null;
}
