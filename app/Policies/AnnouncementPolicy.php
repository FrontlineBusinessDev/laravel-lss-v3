<?php

namespace App\Policies;

use App\Models\User;
use App\Support\Permissions;

/**
 * Auto-discovered policy for App\Models\Batch. Coarse module access is gated by
 * the single `manage announcements` permission (matches the academic module policies).
 */
class AnnouncementPolicy
{
    public function view(User $user): bool
    {
        return $user->can(Permissions::MANAGE_ANNOUNCEMENTS);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_ANNOUNCEMENTS);
    }

    public function update(User $user): bool
    {
        return $user->can(Permissions::MANAGE_ANNOUNCEMENTS);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_ANNOUNCEMENTS);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_ANNOUNCEMENTS);
    }

    public function terminate(User $user): bool
    {
        return $user->can(Permissions::MANAGE_ANNOUNCEMENTS);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_ANNOUNCEMENTS);
    }
}
