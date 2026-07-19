<?php

namespace App\Policies;

use App\Models\LeaveRequest;
use App\Models\User;
use App\Support\Permissions;

/**
 * `manage leave` (developer/admin) can view/approve/decline/delete every
 * request. `manage own leave` (trainee) can create and view/delete their own
 * pending requests. Trainers hold neither permission (RoleSeeder), but can
 * view (`viewAny`/`view`) and approve/decline requests scoped to their own
 * assigned batches (LeaveRequestController::newQuery() already restricts
 * their *list* to those batches; approve/decline re-check it directly since
 * a row could otherwise be reached by guessing an id).
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
        if ($user->can(Permissions::MANAGE_LEAVE)) {
            return true;
        }

        return $user->hasRole('trainer') && $this->assignedToBatch($user, $leaveRequest);
    }

    public function decline(User $user, LeaveRequest $leaveRequest): bool
    {
        if ($user->can(Permissions::MANAGE_LEAVE)) {
            return true;
        }

        return $user->hasRole('trainer') && $this->assignedToBatch($user, $leaveRequest);
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

    private function assignedToBatch(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->assignedBatches()->where('app_batches.id', $leaveRequest->batch_id)->exists();
    }
}
