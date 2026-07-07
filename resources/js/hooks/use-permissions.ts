/**
 * @file hooks/use-permissions.ts
 * Reads the logged-in user's Spatie permissions/roles from the Inertia shared
 * props (see HandleInertiaRequests) and exposes cheap `can` / `hasRole` checks.
 */

import { usePage } from '@inertiajs/react';

export function usePermission() {
    const user = usePage().props.auth?.user;
    const permissions = user?.permissions ?? [];
    const roles = user?.roles ?? [];

    const can = (permission: string): boolean =>
        permissions.includes(permission);
    const hasRole = (role: string): boolean => roles.includes(role);

    return { can, hasRole, permissions, roles };
}
