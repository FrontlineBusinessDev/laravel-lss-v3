<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\Trainees;
use App\Models\User;
use App\Support\Permissions;

/**
 * Coarse module access via `manage tasks` (MANAGE_TASKS), plus an
 * ownership-scoped path for trainees holding only `manage own tasks`
 * (MANAGE_OWN_TASKS) — they may only view/update tasks assigned to their
 * own Trainees row.
 */
class TaskPolicy
{
    public function view(User $user, ?Task $task = null): bool
    {
        if ($user->can(Permissions::MANAGE_TASKS)) {
            return true;
        }

        return $user->can(Permissions::MANAGE_OWN_TASKS) && $this->isOwn($user, $task);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TASKS);
    }

    public function update(User $user, ?Task $task = null): bool
    {
        if ($user->can(Permissions::MANAGE_TASKS)) {
            return true;
        }

        return $user->can(Permissions::MANAGE_OWN_TASKS) && $this->isOwn($user, $task);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_TASKS);
    }

    /** Whether $task belongs to the trainee record linked to $user. */
    protected function isOwn(User $user, ?Task $task): bool
    {
        if (! $task) {
            return false;
        }

        return Trainees::where('user_id', $user->id)->where('id', $task->trainee_id)->exists();
    }
}
