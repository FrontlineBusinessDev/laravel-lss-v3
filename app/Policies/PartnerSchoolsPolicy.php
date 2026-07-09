<?php
// app/Policies/PartnerSchoolPolicy.php
namespace App\Policies;

use App\Models\User;
use App\Models\PartnerSchools;

class PartnerSchoolsPolicy
{
    public function create(User $user): bool
    {
        // Must match whatever backend permission gate you assigned to this module
        return $user->can('manage settings partner schools');
    }

    public function update(User $user, PartnerSchools $partnerSchool): bool
    {
        return $user->can('manage settings partner schools');
    }
}
