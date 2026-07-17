/**
 * @file components/global-modal/GlobalModalProvider.tsx
 * Provides a single per-tree GlobalModalStore via context. Mounted once in
 * AppProviders so any page can drive page-wide modal state with useGlobalModal.
 */

import { createContext, useState } from 'react';
import type { ReactNode } from 'react';
import { createGlobalModalStore } from './store';
import type { GlobalModalStore } from './store';

export const GlobalModalContext = createContext<GlobalModalStore | null>(null);

export function GlobalModalProvider({ children }: { children: ReactNode }) {
    // Lazy initializer runs once → one stable store for the lifetime of the
    // tree (per SSR request / per CSR mount), never recreated across renders.
    const [store] = useState<GlobalModalStore>(createGlobalModalStore);

    return (
        <GlobalModalContext.Provider value={store}>
            {children}
        </GlobalModalContext.Provider>
    );
}

export default GlobalModalProvider;
