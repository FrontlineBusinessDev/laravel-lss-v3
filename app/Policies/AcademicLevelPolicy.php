<?php
// app/Policies/PartnerSchoolPolicy.php
namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

class AcademicLevelPolicy
{
    public function create(User $user): bool
    {
        // Must match whatever backend permission gate you assigned to this module
        return $user->can(Permissions::MANAGE_SETTINGS_ACADEMIC);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_ACADEMIC);
    }
    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_ACADEMIC);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_ACADEMIC);
    }
    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_ACADEMIC);
    }
}
