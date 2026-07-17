/**
 * @file api-service-layer/admin/role.ts
 * Roles (RBAC) service — `/settings/roles` (crudModule). Spatie-backed.
 */

import { createCrudResource } from '../http';

export interface Role extends Record<string, unknown> {
    id: number | string;
    name?: string;
    permissions?: string[];
}

export type RoleInput = Partial<Role> & { permissions?: string[] };

export const roleService = createCrudResource<Role, RoleInput>({
    baseUrl: '/settings/roles',
});
