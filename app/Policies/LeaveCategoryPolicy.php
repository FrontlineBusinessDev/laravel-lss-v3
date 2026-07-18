<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

/**
 * Auto-discovered policy for App\Models\LeaveCategory. Coarse module access is
 * gated by the single `manage leave` permission (same actors who manage leave
 * requests configure the per-category limits).
 */
class LeaveCategoryPolicy
{
    public function view(User $user): bool
    {
        return $user->can(Permissions::MANAGE_LEAVE);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_LEAVE);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_LEAVE);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_LEAVE);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_LEAVE);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_LEAVE);
    }
}
