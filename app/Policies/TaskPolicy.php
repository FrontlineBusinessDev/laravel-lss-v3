<?php

namespace App\Policies;

use App\Models\Task;
use App\Models\Trainees;
use App\Models\User;
use App\Support\Permissions;

/**
 * Coarse module access via `manage tasks` (MANAGE_TASKS) — held by both
 * admin/developer (unrestricted) and trainer (RoleSeeder), plus an
 * ownership-scoped path for trainees holding only `manage own tasks`
 * (MANAGE_OWN_TASKS) — they may only view/update tasks assigned to their
 * own Trainees row. Trainers are further restricted to tasks in their own
 * assigned batches on every row-level action.
 */
class TaskPolicy
{
    public function view(User $user, ?Task $task = null): bool
    {
        if ($user->can(Permissions::MANAGE_TASKS)) {
            return $this->canMutate($user, $task);
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
            return $this->canMutate($user, $task);
        }

        return $user->can(Permissions::MANAGE_OWN_TASKS) && $this->isOwn($user, $task);
    }

    public function delete(User $user, ?Task $task = null): bool
    {
        if ($user->can(Permissions::MANAGE_TASKS)) {
            return $this->canMutate($user, $task);
        }

        return false;
    }

    /** Whether $task belongs to the trainee record linked to $user. */
    protected function isOwn(User $user, ?Task $task): bool
    {
        if (! $task) {
            return false;
        }

        return Trainees::where('user_id', $user->id)->where('id', $task->trainee_id)->exists();
    }

    /** Admin/developer: unrestricted. Trainer: only tasks in their assigned batches. */
    protected function canMutate(User $user, ?Task $task): bool
    {
        if (! $user->hasRole('trainer') || $user->hasAnyRole(['admin', 'developer'])) {
            return true;
        }

        if (! $task) {
            return true;
        }

        return $user->assignedBatches()->where('app_batches.id', $task->batch_id)->exists();
    }
}
