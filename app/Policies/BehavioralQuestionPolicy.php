<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

class BehavioralQuestionPolicy
{
    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BEHAVIORAL_QUESTIONS);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BEHAVIORAL_QUESTIONS);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BEHAVIORAL_QUESTIONS);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BEHAVIORAL_QUESTIONS);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_BEHAVIORAL_QUESTIONS);
    }
}
