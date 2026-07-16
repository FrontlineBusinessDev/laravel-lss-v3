<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

class RatePolicy
{
    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_RATES);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_RATES);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_RATES);
    }
}
