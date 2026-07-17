<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

/**
 * Auto-discovered policy for App\Models\Batch. Coarse module access is gated by
 * the single `manage trainees` permission (matches the trainees module policies).
 */
class TraineesPolicy
{
    public function view(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function terminate(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function linkAccount(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }

    public function unlinkAccount(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TRAINEES);
    }
}
