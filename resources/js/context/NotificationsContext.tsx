import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react'
import { notifications as initialNotifications } from '@/data/mockData'
import type { AppNotification, NotificationAudience } from '@/types'

interface NotificationsContextValue {
  /** All admin-facing notifications, newest first. Pending leave requests stay unread until acted on. */
  adminNotifications: AppNotification[]
  unreadAdminCount: number
  markRead: (id: string) => void
  markAllRead: () => void
  /** Push a new notification. Used when a leave request is submitted/approved/declined. */
  notify: (n: Omit<AppNotification, 'id' | 'read'>) => void
  /** Mark every unread admin notification tied to a given leave request as read (called once it's approved/declined). */
  resolveForLeave: (leaveId: string) => void
  /** All trainee-facing notifications ever sent. There's no trainee UI in this admin console to display
   *  them in, but they're recorded so the notification flow is verifiable end-to-end. */
  traineeNotifications: AppNotification[]
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null)

let idCounter = 1000

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<AppNotification[]>(initialNotifications)

  const notify = useCallback((n: Omit<AppNotification, 'id' | 'read'>) => {
    const created: AppNotification = { ...n, id: `nt-${++idCounter}`, read: false }
    setItems((prev) => [created, ...prev])
  }, [])

  const markRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllRead = useCallback(() => {
    setItems((prev) => prev.map((n) => (n.audience === 'admin' ? { ...n, read: true } : n)))
  }, [])

  const resolveForLeave = useCallback((leaveId: string) => {
    setItems((prev) => prev.map((n) => (n.relatedLeaveId === leaveId && n.audience === 'admin' ? { ...n, read: true } : n)))
  }, [])

  const byAudience = useCallback((audience: NotificationAudience) => items.filter((n) => n.audience === audience), [items])

  const value = useMemo<NotificationsContextValue>(() => {
    const adminNotifications = [...byAudience('admin')].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    return {
      adminNotifications,
      unreadAdminCount: adminNotifications.filter((n) => !n.read).length,
      markRead,
      markAllRead,
      notify,
      resolveForLeave,
      traineeNotifications: byAudience('trainee'),
    }
  }, [byAudience, markRead, markAllRead, notify, resolveForLeave])

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within a NotificationsProvider')
  return ctx
}
