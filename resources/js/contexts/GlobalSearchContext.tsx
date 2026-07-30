/**
 * @file contexts/GlobalSearchContext.tsx
 * Shared open/close state for the global search overlay (`GlobalSearch.tsx`),
 * mounted once in `AppLayout.tsx`. Any nav trigger (Sidebar, TopBar) calls
 * `useGlobalSearchTrigger().open()` instead of owning its own boolean, so the
 * button, the Ctrl+K/Cmd+K shortcut, and Escape all control the same overlay.
 */

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from 'react';

interface GlobalSearchContextValue {
    isOpen: boolean;
    open: () => void;
    close: () => void;
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(
    null,
);

export function GlobalSearchProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const isCommandK =
                (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';

            if (isCommandK) {
                e.preventDefault();
                setIsOpen((prev) => !prev);
                return;
            }

            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, []);

    const value = useMemo(
        () => ({ isOpen, open, close }),
        [isOpen, open, close],
    );

    return (
        <GlobalSearchContext.Provider value={value}>
            {children}
        </GlobalSearchContext.Provider>
    );
}

/** Consumed by the overlay itself (`GlobalSearch.tsx`) and by nav triggers. */
export function useGlobalSearchTrigger(): GlobalSearchContextValue {
    const ctx = useContext(GlobalSearchContext);
    if (!ctx) {
        throw new Error(
            'useGlobalSearchTrigger must be used within a GlobalSearchProvider',
        );
    }
    return ctx;
}
