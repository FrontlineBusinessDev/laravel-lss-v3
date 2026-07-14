/**
 * @file api-service-layer/roles.ts
 * Single source of truth for role identity and the `developer === admin` rule:
 * the developer role inherits admin's permissions, access, and behavior. Both
 * the runtime helpers here and the service-layer directory layout
 * (`developer/*` re-exports `admin/*`) express that same equivalence.
 */

export const APP_ROLES = ['developer', 'admin', 'trainer', 'trainee'] as const;

export type AppRole = (typeof APP_ROLES)[number];

/**
 * Collapses `developer` onto `admin` for capability/behavior checks so a
 * developer resolves to the exact same access surface as an admin. Non-admin
 * roles pass through unchanged.
 */
export function normalizeRole(role: string | null | undefined): AppRole {
    if (role === 'developer') {
        return 'admin';
    }

    return (APP_ROLES as readonly string[]).includes(role ?? '')
        ? (role as AppRole)
        : 'admin';
}

/** True when the role has admin-level access (developer or admin). */
export function sharesAdminAccess(role: string | null | undefined): boolean {
    return role === 'developer' || role === 'admin';
}

/**
 * Roles an actor may assign to others. Mirrors UserController::assignableRoles
 * so the frontend matrix stays in lockstep with the backend; developer keeps
 * its superset (it can grant developer), while its access rights equal admin's.
 */
export function assignableRoles(actorRole: string | null | undefined): AppRole[] {
    if (actorRole === 'developer') {
        return ['developer', 'admin', 'trainer'];
    }

    if (actorRole === 'admin') {
        return ['admin', 'trainer'];
    }

    return [];
}
