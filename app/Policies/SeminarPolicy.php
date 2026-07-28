<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

class SeminarPolicy
{
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
}
