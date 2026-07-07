import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { AppShell } from '@/components/AppShell';
import { BatchesProvider } from '@/context/BatchesContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { ToastProvider } from '@/components/Toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const appName = import.meta.env.VITE_APP_NAME || 'LSS Admin';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name) => {
        const page = await resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')) as any;
        
        // Automatically wrap non-auth pages in the AppShell layout
        if (!name.startsWith('auth/')) {
            page.default.layout = page.default.layout || ((page: React.ReactNode) => <AppShell>{page}</AppShell>);
        }
        
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        const queryClient = new QueryClient();
        root.render(
            <QueryClientProvider client={queryClient}>
                <ToastProvider>
                    <NotificationsProvider>
                        <BatchesProvider>
                            {/* Keep <App /> at the top layer so Inertia context is available everywhere */}
                            <App {...props} />
                        </BatchesProvider>
                    </NotificationsProvider>
                </ToastProvider>
            </QueryClientProvider>,
        );
    },
    progress: {
        color: '#2176E3',
    },
});