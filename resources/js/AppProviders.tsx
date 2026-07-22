import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { GlobalModalProvider } from './components/global-modal';
import { SystemToastProvider } from './components/Toast';
import { NotificationsProvider } from './context/NotificationsContext';

/**
 * Builds a QueryClient with the same options on the server and the client.
 * `staleTime: Infinity` keeps hydration stable — the client won't instantly
 * refetch list queries on mount and diverge from the server-rendered markup.
 * A fresh instance per call avoids leaking cached data between SSR requests.
 */
export function makeQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
            },
        },
    });
}

/**
 * Single provider tree shared by the client entry (`app.tsx`) and the SSR entry
 * (`ssr.tsx`). Keeping the nesting in one place guarantees the server-rendered
 * HTML and the client render match, preventing hydration mismatches.
 */
export function AppProviders({
    client,
    children,
}: {
    client: QueryClient;
    children: ReactNode;
}) {
    return (
        <QueryClientProvider
            client={client}
            // data-cy="app-providers-query-client-provider-1"
        >
            <SystemToastProvider data-cy="app-providers-system-toast-provider-2">
                <NotificationsProvider data-cy="app-providers-notifications-provider-4">
                    <GlobalModalProvider data-cy="app-providers-batches-provider-6">
                        {children}
                    </GlobalModalProvider>
                </NotificationsProvider>
            </SystemToastProvider>
        </QueryClientProvider>
    );
}
