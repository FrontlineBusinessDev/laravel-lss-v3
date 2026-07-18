import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';
import { notificationService } from '@/api-service-layer/notification';
import type { NotificationRow } from '@/api-service-layer/notification';
import type { AppNotification } from '@/types';

function toAppNotification(row: NotificationRow): AppNotification {
    return {
        id: String(row.id),
        audience: 'admin',
        title: row.title,
        body: row.body ?? '',
        createdAt: row.created_at,
        read: row.read_at !== null,
        link: '/leave',
    };
}

interface NotificationsContextValue {
    /** The logged-in user's own notifications, newest first. Already scoped
     *  server-side to their user id (NotificationController@index), so this
     *  is correct for any role — admin, trainer, or trainee. */
    notifications: AppNotification[];
    unreadCount: number;
    markRead: (id: string) => void;
    markAllRead: () => void;
    /** Pushes a locally-simulated notification. Only backs the still-mocked
     *  Seminars / Evaluation-reminder features — not persisted server-side. */
    notify: (n: Omit<AppNotification, 'id' | 'read'>) => void;
    /** Locally-simulated trainee-facing notifications sent via `notify`
     *  (Evaluation reminders panel). Not backed by the real API. */
    traineeNotifications: AppNotification[];
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
    null,
);
let idCounter = 1000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<AppNotification[]>([]);
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
            read: false,
        };
        setItems((prev) => [created, ...prev]);
    }, []);

    const markRead = useCallback((id: string) => {
        setRealItems((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
        );
        void notificationService.markRead(Number(id));
    }, []);

    const markAllRead = useCallback(() => {
        setRealItems((prev) => prev.map((n) => ({ ...n, read: true })));
        void notificationService.markAllRead();
    }, []);

    const traineeNotifications = useMemo(
        () => items.filter((n) => n.audience === 'trainee'),
        [items],
    );

    const value = useMemo<NotificationsContextValue>(() => {
        const notifications = [...realItems].sort((a, b) =>
            a.createdAt < b.createdAt ? 1 : -1,
        );
        return {
            notifications,
            unreadCount: notifications.filter((n) => !n.read).length,
            markRead,
            markAllRead,
            notify,
            traineeNotifications,
        };
    }, [realItems, markRead, markAllRead, notify, traineeNotifications]);

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
}

export function useNotifications() {
    const ctx = useContext(NotificationsContext);
    if (!ctx) {
        throw new Error(
            'useNotifications must be used within a NotificationsProvider',
        );
    }
    return ctx;
}
