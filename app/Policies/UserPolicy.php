<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

/**
 * Coarse-grained authorization for the Users admin API. Every ability maps to
 * the single `manage users` permission (developer + admin have it; the
 * creator-scoped role matrix is enforced separately in UserController).
 * Auto-discovered by Laravel for the App\Models\User model.
 */
class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }

    public function view(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_USERS);
    }
}
