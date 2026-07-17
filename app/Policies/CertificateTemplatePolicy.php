<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

class CertificateTemplatePolicy
{
    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_CERTIFICATES);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_CERTIFICATES);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_CERTIFICATES);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_CERTIFICATES);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_CERTIFICATES);
    }
}
