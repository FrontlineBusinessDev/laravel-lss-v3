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
    const roles = user?.roles ?? [];
    // A user may hold more than one role; this derives a single "home
    // experience" label (display-only) using the same priority as the
    // backend's redirect/search dispatch: admin/developer > trainer > trainee.
    const role = roles.includes('developer')
        ? 'developer'
        : roles.includes('admin')
          ? 'admin'
          : roles.includes('trainer')
            ? 'trainer'
            : roles.includes('trainee')
              ? 'trainee'
              : 'admin';

    return {
        user,
        role,
        roles,
        displayName: user?.name ?? 'Guest',
        email: user?.email ?? '',
        initials: user ? initialsFor(user.name) : '—',
    };
}
