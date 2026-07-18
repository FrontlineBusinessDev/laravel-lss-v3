<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;
use App\Support\Permissions;

/**
 * `manage leave` (developer/admin) can view/approve/decline/delete every
 * request. `manage own leave` (trainee) can create and view/delete their own
 * pending requests. Trainers hold neither permission (RoleSeeder) but get
 * read-only visibility into who's on leave via `viewAny`/`view`.
 */
class LeaveRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can(Permissions::MANAGE_LEAVE)
            || $user->can(Permissions::MANAGE_OWN_LEAVE)
            || $user->hasRole('trainer');
    }

    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        if ($user->can(Permissions::MANAGE_LEAVE) || $user->hasRole('trainer')) {
            return true;
        }

        return $user->can(Permissions::MANAGE_OWN_LEAVE) && $this->ownsRequest($user, $leaveRequest);
    }

    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_OWN_LEAVE);
    }

    public function approve(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->can(Permissions::MANAGE_LEAVE);
    }

    public function decline(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->can(Permissions::MANAGE_LEAVE);
    }

    public function delete(User $user, LeaveRequest $leaveRequest): bool
    {
        if ($user->can(Permissions::MANAGE_LEAVE)) {
            return true;
        }

        return $user->can(Permissions::MANAGE_OWN_LEAVE)
            && $this->ownsRequest($user, $leaveRequest)
            && $leaveRequest->status === 'pending';
    }

    private function ownsRequest(User $user, LeaveRequest $leaveRequest): bool
    {
        $leaveRequest->loadMissing('trainee');

        return $leaveRequest->trainee?->user_id === $user->id;
    }
}
