import { router } from '@inertiajs/react';
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

/**
 * `NotificationsProvider` sits above Inertia's `<App>` in the tree (see
 * AppProviders.tsx), so `usePage()` can't be used here — there's no Inertia
 * page context yet at this level. `router.on('navigate', ...)` fires on
 * every visit (including the initial page load) with the page's props in
 * `event.detail.page.props`, which is how we track auth state outside of
 * React's context.
 */
function authUserFromNavigateEvent(
    event: CustomEvent<{ page?: { props?: { auth?: { user?: unknown } } } }>,
): unknown {
    return event.detail.page?.props?.auth?.user;
}
import type { NotificationRow } from '@/api-service-layer/notification';
import type { AppNotification } from '@/types/modules/notifications/notification';

/** Resolves the click-through target by notification type — new types add a case here. */
function linkFor(row: NotificationRow): string {
    if (row.type?.startsWith('registration.')) {
        const traineeId = row.data?.trainee_id;
        return traineeId ? `/trainees/${traineeId}` : '/trainees';
    }

    return '/leave';
}

function toAppNotification(row: NotificationRow): AppNotification {
    return {
        id: String(row.id),
        audience: 'admin',
        title: row.title,
        body: row.body ?? '',
        createdAt: row.created_at,
        read: row.read_at !== null,
        link: linkFor(row),
        type: row.type,
        data: row.data,
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
    const [user, setUser] = useState<unknown>(undefined);
    const [items, setItems] = useState<AppNotification[]>([]);
    const [realItems, setRealItems] = useState<AppNotification[]>([]);

    useEffect(() => {
        return router.on('navigate', (event) =>
            setUser(authUserFromNavigateEvent(event)),
        );
    }, []);

    const refreshReal = useCallback(async () => {
        try {
            const res = await notificationService.list();
            setRealItems(res.data.map(toAppNotification));
        } catch {
            // Polling failure is non-fatal — keep showing the last known state.
        }
    }, []);

    useEffect(() => {
        // Guest pages (login, register, forgot-password) mount this provider
        // too, since it wraps every Inertia page — skip the fetch/interval
        // entirely when there's no authenticated user to poll for.
        if (!user) {
            return;
        }
        refreshReal();
        const id = setInterval(refreshReal, 20000);
        return () => clearInterval(id);
    }, [refreshReal, user]);

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
