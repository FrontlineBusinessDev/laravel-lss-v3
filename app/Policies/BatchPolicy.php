<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

/**
 * Auto-discovered policy for App\Models\Batch. Coarse module access is gated by
 * the single `manage batches` permission (matches the academic module policies).
 */
class BatchPolicy
{
    public function view(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BATCHES);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BATCHES);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BATCHES);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BATCHES);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BATCHES);
    }

    public function terminate(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BATCHES);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BATCHES);
    }
}
