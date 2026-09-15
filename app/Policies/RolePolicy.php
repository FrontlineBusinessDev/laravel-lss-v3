<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;
use Spatie\Permission\Models\Role;

/**
 * Coarse-grained authorization for the Roles admin API. Every ability maps to
 * the single `manage roles` permission; RoleController itself blocks
 * renaming/deleting the protected core roles.
 * Auto-discovered by Laravel for the Spatie\Permission\Models\Role model.
 */
class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_ROLES);
    }

    public function view(User $user, Role $role): bool
    {
        return $user->can(Permissions::MANAGE_ROLES);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_ROLES);
    }

    public function update(User $user, Role $role): bool
    {
        return $user->can(Permissions::MANAGE_ROLES);
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->can(Permissions::MANAGE_ROLES);
    }

    public function archive(User $user, Role $role): bool
    {
        return $user->can(Permissions::MANAGE_ROLES);
    }

    public function restore(User $user, Role $role): bool
    {
        return $user->can(Permissions::MANAGE_ROLES);
    }
}
