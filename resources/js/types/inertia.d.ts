/**
 * Global augmentation of Inertia's shared page props.
 *
 * App\Http\Middleware\HandleInertiaRequests always shares `auth.user`
 * (id, name, roles, permissions) on authenticated pages, so surface that shape
 * to `usePage()` consumers (DataTableField, usePermission, …).
 */
import '@inertiajs/core';

declare module '@inertiajs/core' {
    interface PageProps {
        auth: {
            user: {
                id: number;
                first_name: string;
                last_name: string;
                name: string;
                email: string;
                roles: string[];
                permissions: string[];
            };
        };
        flash?: {
            success?: string | null;
            error?: string | null;
        };
    }
}
