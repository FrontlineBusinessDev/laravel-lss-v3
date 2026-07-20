<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

class EvaluationTrainerQuestionPolicy
{
    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_EVALUATION);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_EVALUATION);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_EVALUATION);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_EVALUATION);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_EVALUATION);
    }
}
