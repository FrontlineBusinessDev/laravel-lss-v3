/**
 * @file components/global-modal/use-global-modal.ts
 * Dynamic, key-value modal-state hook.
 *
 *   const modal = useGlobalModal<Row | null>('partnerSchool', null);
 *   modal.open;             // boolean
 *   modal.data;             // Row | null
 *   modal.setOpen(true);    // open / close
 *   modal.setData(row);     // attach edit data (or null to clear)
 *
 * Each key subscribes independently, so toggling one modal never re-renders
 * consumers bound to a different key.
 */

import { useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { GlobalModalContext } from './GlobalModalProvider';

export interface GlobalModalHandle<T> {
    open: boolean;
    data: T;
    setOpen: (open: boolean) => void;
    setData: (data: T) => void;
}

export function useGlobalModal<T>(
    key: string,
    defaultData: T,
): GlobalModalHandle<T> {
    const store = useContext(GlobalModalContext);

    if (!store) {
        throw new Error('useGlobalModal must be used within a GlobalModalProvider');
    }

    const subscribe = useCallback(
        (listener: () => void) => store.subscribe(key, listener),
        [store, key],
    );

    // Same store instance on server + client, and getEntry returns a stable
    // reference until the entry mutates — safe for useSyncExternalStore's
    // getServerSnapshot too.
    const getSnapshot = useCallback(
        () => store.getEntry<T>(key, defaultData),
        [store, key, defaultData],
    );

    const entry = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

    const setOpen = useCallback(
        (open: boolean) => store.setOpen(key, open),
        [store, key],
    );
    const setData = useCallback(
        (data: T) => store.setData<T>(key, data),
        [store, key],
    );

    return useMemo(
        () => ({ open: entry.open, data: entry.data, setOpen, setData }),
        [entry.open, entry.data, setOpen, setData],
    );
}

export default useGlobalModal;
