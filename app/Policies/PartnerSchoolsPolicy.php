<?php
// app/Policies/PartnerSchoolPolicy.php
namespace App\Policies;

use App\Models\User;
use App\Models\PartnerSchools;
use App\Support\Permissions;

class PartnerSchoolsPolicy
{
    public function create(User $user): bool
    {
        // Must match whatever backend permission gate you assigned to this module
        return $user->can(Permissions::MANAGE_SETTINGS_PARTNER_SCHOOLS);
    }
    public function update(User $user, PartnerSchools $partnerSchool): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_PARTNER_SCHOOLS);
    }
    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_PARTNER_SCHOOLS);
    }
    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_PARTNER_SCHOOLS);
    }
}
