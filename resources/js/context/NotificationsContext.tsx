import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { notifications as initialNotifications } from '@/data/mockData';
import { notificationService } from '@/api-service-layer/notification';
import type { NotificationRow } from '@/api-service-layer/notification';
import type { AppNotification, NotificationAudience } from '@/types';

/** Real notification ids are numeric on the backend; prefix to keep them
 *  distinguishable from mock ids (`nt-XXXX`) in markRead/markAllRead. */
const REAL_ID_PREFIX = 'real-';

function toAppNotification(row: NotificationRow): AppNotification {
    return {
        id: `${REAL_ID_PREFIX}${row.id}`,
        audience: 'admin',
        title: row.title,
        body: row.body ?? '',
        createdAt: row.created_at,
        read: row.read_at !== null,
        link: '/leave',
    };
}
interface NotificationsContextValue {
  /** All admin-facing notifications, newest first. Pending leave requests stay unread until acted on. */
  adminNotifications: AppNotification[];
  unreadAdminCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  /** Push a new notification. Used when a leave request is submitted/approved/declined. */
  notify: (n: Omit<AppNotification, 'id' | 'read'>) => void;
  /** Mark every unread admin notification tied to a given leave request as read (called once it's approved/declined). */
  resolveForLeave: (leaveId: string) => void;
  /** All trainee-facing notifications ever sent. There's no trainee UI in this admin console to display
   *  them in, but they're recorded so the notification flow is verifiable end-to-end. */
  traineeNotifications: AppNotification[];
}
const NotificationsContext = createContext<NotificationsContextValue | null>(null);
let idCounter = 1000;
export function NotificationsProvider({
  children
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<AppNotification[]>(initialNotifications);
  const [realItems, setRealItems] = useState<AppNotification[]>([]);

  const refreshReal = useCallback(async () => {
    try {
      const res = await notificationService.list();
      setRealItems(res.data.map(toAppNotification));
    } catch {
      // Polling failure is non-fatal — keep showing the last known state.
    }
  }, []);

  useEffect(() => {
    refreshReal();
    const id = setInterval(refreshReal, 20000);
    return () => clearInterval(id);
  }, [refreshReal]);

  const notify = useCallback((n: Omit<AppNotification, 'id' | 'read'>) => {
    const created: AppNotification = {
      ...n,
      id: `nt-${++idCounter}`,
      read: false
    };
    setItems(prev => [created, ...prev]);
  }, []);
  const markRead = useCallback((id: string) => {
    if (id.startsWith(REAL_ID_PREFIX)) {
      const realId = Number(id.slice(REAL_ID_PREFIX.length));
      setRealItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      void notificationService.markRead(realId);
      return;
    }
    setItems(prev => prev.map(n => n.id === id ? {
      ...n,
      read: true
    } : n));
  }, []);
  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(n => n.audience === 'admin' ? {
      ...n,
      read: true
    } : n));
    setRealItems(prev => prev.map(n => ({ ...n, read: true })));
    void notificationService.markAllRead();
  }, []);
  const resolveForLeave = useCallback((leaveId: string) => {
    setItems(prev => prev.map(n => n.relatedLeaveId === leaveId && n.audience === 'admin' ? {
      ...n,
      read: true
    } : n));
  }, []);
  const byAudience = useCallback((audience: NotificationAudience) => items.filter(n => n.audience === audience), [items]);
  const value = useMemo<NotificationsContextValue>(() => {
    const adminNotifications = [...byAudience('admin'), ...realItems].sort((a, b) => a.createdAt < b.createdAt ? 1 : -1);
    return {
      adminNotifications,
      unreadAdminCount: adminNotifications.filter(n => !n.read).length,
      markRead,
      markAllRead,
      notify,
      resolveForLeave,
      traineeNotifications: byAudience('trainee')
    };
  }, [byAudience, realItems, markRead, markAllRead, notify, resolveForLeave]);
  return <NotificationsContext.Provider value={value} data-cy="notifications-context-notifications-context-provider-1">{children}</NotificationsContext.Provider>;
}
export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider');
  return ctx;
}