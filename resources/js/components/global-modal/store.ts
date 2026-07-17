/**
 * @file components/global-modal/store.ts
 * A tiny per-key external store backing <GlobalModalProvider> / useGlobalModal.
 *
 * Each modal key owns an immutable `{ open, data }` snapshot; a mutation
 * replaces that key's object reference and notifies only that key's listeners.
 * Consumers subscribe per-key via useSyncExternalStore, so toggling one modal
 * never re-renders consumers of a different key.
 */

/** Immutable snapshot for a single modal key. */
export interface ModalEntry<T = unknown> {
    open: boolean;
    data: T;
}

type Listener = () => void;

export interface GlobalModalStore {
    /** Returns the current (stable) snapshot for a key, seeding it if absent. */
    getEntry: <T>(key: string, defaultData: T) => ModalEntry<T>;
    setOpen: (key: string, open: boolean) => void;
    setData: <T>(key: string, data: T) => void;
    subscribe: (key: string, listener: Listener) => () => void;
}

/**
 * Creates an isolated store instance. One per provider so server-rendered
 * requests never share modal state (mirrors makeQueryClient's per-request
 * isolation in AppProviders).
 */
export function createGlobalModalStore(): GlobalModalStore {
    const entries = new Map<string, ModalEntry>();
    const listeners = new Map<string, Set<Listener>>();

    const emit = (key: string) => {
        listeners.get(key)?.forEach((listener) => listener());
    };

    const ensure = <T>(key: string, defaultData: T): ModalEntry<T> => {
        if (!entries.has(key)) {
            entries.set(key, { open: false, data: defaultData });
        }

        return entries.get(key) as ModalEntry<T>;
    };

    return {
        getEntry: (key, defaultData) => ensure(key, defaultData),
        setOpen: (key, open) => {
            const current = ensure(key, undefined as unknown);

            if (current.open === open) {
                return;
            }

            entries.set(key, { open, data: current.data });
            emit(key);
        },
        setData: (key, data) => {
            const current = ensure(key, data);

            if (current.data === data) {
                return;
            }

            entries.set(key, { open: current.open, data });
            emit(key);
        },
        subscribe: (key, listener) => {
            const set = listeners.get(key) ?? new Set<Listener>();
            set.add(listener);
            listeners.set(key, set);

            return () => {
                set.delete(listener);
            };
        },
    };
}
