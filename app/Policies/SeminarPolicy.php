<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

/**
 * Coarse module access gated by the single `manage seminars` permission,
 * matching BatchesPolicy's shape.
 */
class SeminarPolicy
{
    public function view(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SEMINARS);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SEMINARS);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SEMINARS);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SEMINARS);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SEMINARS);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SEMINARS);
    }

    /** Complete/Close/Dissolve — lifecycle transitions distinct from the active/inactive archive flag. */
    public function transition(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SEMINARS);
    }
}
