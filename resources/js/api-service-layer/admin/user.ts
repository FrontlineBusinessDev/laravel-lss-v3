/**
 * @file api-service-layer/admin/user.ts
 * Users service — `/settings/users` (crudModule) plus the custom
 * `POST /settings/users/{id}/reset-password` endpoint. `archive` blocks the
 * user from logging in (Archive = Suspended).
 */

import { http } from '../client';
import { createCrudResource } from '../http';

export interface User extends Record<string, unknown> {
    id: number | string;
    first_name?: string;
    last_name?: string;
    name?: string;
    email?: string;
    roles?: string[];
    status?: string;
}

export type UserInput = Partial<User> & {
    role?: string;
    password?: string;
    password_confirmation?: string;
};

const base = createCrudResource<User, UserInput>({ baseUrl: '/settings/users' });

export const userService = {
    ...base,

    /** POST /settings/users/{id}/reset-password — emails a reset link. */
    sendPasswordReset: async (id: string | number): Promise<void> => {
        await http.post(`/settings/users/${id}/reset-password`);
    },
};
