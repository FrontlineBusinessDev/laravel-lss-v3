import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        // Serves the React Refresh runtime (`/@react-refresh`) that the
        // @viteReactRefresh Blade directive expects. Without this plugin the
        // preamble 404s on first load. babel-plugin-react-compiler is already a
        // project dependency, so wire it through the plugin's babel config.
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        inertia(),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
});
