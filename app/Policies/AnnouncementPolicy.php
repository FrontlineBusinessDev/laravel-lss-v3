<?php

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;
use App\Support\Permissions;

/**
 * Coarse module access is gated by `manage announcements`, which both
 * admin/developer and trainer roles hold (RoleSeeder). Trainers are further
 * restricted to their own authored announcements on every row-level action
 * (update/archive/restore/delete) — admin/developer are not, since they're
 * never assigned as `created_by_id` owners in the trainer sense.
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

    public function update(User $user, Announcement $announcement): bool
    {
        return $this->canMutate($user, $announcement);
    }

    public function archive(User $user, Announcement $announcement): bool
    {
        return $this->canMutate($user, $announcement);
    }

    public function restore(User $user, Announcement $announcement): bool
    {
        return $this->canMutate($user, $announcement);
    }

    public function delete(User $user, Announcement $announcement): bool
    {
        return $this->canMutate($user, $announcement);
    }

    private function canMutate(User $user, Announcement $announcement): bool
    {
        if (! $user->can(Permissions::MANAGE_ANNOUNCEMENTS)) {
            return false;
        }

        if ($user->hasRole('trainer') && ! $user->hasAnyRole(['admin', 'developer'])) {
            return $announcement->created_by_id === $user->id;
        }

        return true;
    }
}
