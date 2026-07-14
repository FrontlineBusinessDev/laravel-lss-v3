import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { AppProviders, makeQueryClient } from './AppProviders';
import AppLayout from './layouts/AppLayout';
import SettingsAcademicLayout from './layouts/settings/SettingsAcademicLayout';
import SettingsPrimaryLayout from './layouts/settings/SettingsPrimaryLayout';
const appName = import.meta.env.VITE_APP_NAME || 'LSS Admin';
createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob<{
            default: any;
        }>('./pages/**/*.tsx', {
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
            case name.includes('settings/academic'):
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
        // The provider tree and QueryClient options are shared with ssr.tsx via
        // AppProviders so a client render matches the server-rendered HTML.
        const tree = (
            <AppProviders
                client={makeQueryClient()}
                data-cy="app-app-providers-1"
            >
                <App {...props} />
            </AppProviders>
        );

        // Hydrate only when the server actually rendered markup (SSR enabled).
        // With SSR off, Inertia ships an empty #app div, so hydrateRoot would
        // report "Hydration failed …"; use createRoot instead. This keeps the
        // entry correct whether INERTIA_SSR_ENABLED is on or off.
        if (el.hasChildNodes()) {
            hydrateRoot(el, tree);
        } else {
            createRoot(el).render(tree);
        }
    },
    progress: {
        color: '#2176E3',
    },
});
