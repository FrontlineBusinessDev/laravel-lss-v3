import { BatchesProvider } from '@/context/BatchesContext';
import { NotificationsProvider } from '@/context/NotificationsContext';
import { createInertiaApp } from '@inertiajs/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { SystemToastProvider } from './components/Toast';
import { ToastProvider } from './hooks/use-toast';
import AppLayout from './layouts/AppLayout';
import SettingsAcademicLayout from './layouts/settings/SettingsAcademicLayout';
import SettingsPrimaryLayout from './layouts/settings/SettingsPrimaryLayout';

const appName = import.meta.env.VITE_APP_NAME || 'LSS Admin';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob<{ default: any }>('./pages/**/*.tsx', {
            eager: true,
        });
        const key = Object.keys(pages).find(
            (k) => k.toLowerCase() === `./pages/${name}.tsx`.toLowerCase(),
        );
        if (!key) throw new Error(`Page not found: ./pages/${name}.tsx`);
        return pages[key];
    },
    layout: (name) => {
        switch (true) {
            case name === 'welcome' || name.startsWith('auth/'):
                return null;
            case name.startsWith('public/'):
                return null;
            case name.startsWith('settings/academic'):
                return [
                    AppLayout,
                    SettingsPrimaryLayout,
                    SettingsAcademicLayout,
                ];
            case name.startsWith('settings/'):
                return [AppLayout];
            default:
                return [AppLayout];
        }
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        const queryClient = new QueryClient();
        root.render(
            <QueryClientProvider client={queryClient}>
                <SystemToastProvider>
                    <ToastProvider>
                        <NotificationsProvider>
                            <BatchesProvider>
                                {/* Keep <App /> at the top layer so Inertia context is available everywhere */}
                                <App {...props} />
                            </BatchesProvider>
                        </NotificationsProvider>
                    </ToastProvider>
                </SystemToastProvider>
            </QueryClientProvider>,
        );
    },
    progress: {
        color: '#2176E3',
    },
});
