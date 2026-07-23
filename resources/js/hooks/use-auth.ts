import { usePage } from '@inertiajs/react';

export interface AuthUser {
    id: number;
    first_name: string;
    last_name: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
}

function initialsFor(name: string): string {
    const parts = name.trim().split(/\s+/);
    return parts
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('');
}

/**
 * The logged-in user, shared globally by
 * App\Http\Middleware\HandleInertiaRequests. Almost every module in the LSS
 * admin frontend is now backend-driven; the Seminars admin module is the
 * sole remaining exception still reading from data/mockData.ts (deferred —
 * see memory).
 */
export function useAuth() {
    const { props } = usePage();
    const user = props.auth?.user ?? null;
    const role = user?.roles?.[0] ?? 'admin';

    return {
        user,
        role,
        displayName: user?.name ?? 'Guest',
        email: user?.email ?? '',
        initials: user ? initialsFor(user.name) : '—',
    };
}
