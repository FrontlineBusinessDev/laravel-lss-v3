import { createInertiaApp } from '@inertiajs/react';
import createServerHtml from '@inertiajs/react/server';
import ReactDOMServer from 'react-dom/server';
import { AppProviders, makeQueryClient } from './AppProviders';
import AppLayout from './layouts/AppLayout';
import SettingsAcademicLayout from './layouts/settings/SettingsAcademicLayout';
import SettingsPrimaryLayout from './layouts/settings/SettingsPrimaryLayout';

const appName = import.meta.env.VITE_APP_NAME || 'LSS Admin';

createServerHtml((page) =>
    createInertiaApp({
        page,
        render: ReactDOMServer.renderToString,
        title: (title) => (title ? `${title} - ${appName}` : appName),
        resolve: (name) => {
            const pages = import.meta.glob<{ default: any }>(
                './pages/**/*.tsx',
                {
                    eager: true,
                },
            );
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
        setup: ({ App, props }) => {
            // Fresh client per request (no cross-request data leak); shares the
            // exact provider tree + options with app.tsx via AppProviders.
            return (
                <AppProviders client={makeQueryClient()}>
                    <App {...props} />
                </AppProviders>
            );
        },
    }),
);
