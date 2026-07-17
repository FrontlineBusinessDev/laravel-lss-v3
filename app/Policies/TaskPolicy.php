<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

/** Auto-discovered policy for App\Models\Task. Coarse module access is gated by the single `manage tasks` (MANAGE_TASKS) permission. */
class TaskPolicy
{
    public function view(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TASKS);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TASKS);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TASKS);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TASKS);
    }
}
