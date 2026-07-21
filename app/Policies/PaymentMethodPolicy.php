<?php

namespace App\Policies;

use App\Models\PaymentMethod;
use App\Models\User;
use App\Support\Permissions;

class PaymentMethodPolicy
{
    public function create(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_PAYMENT_METHODS);
    }

    public function update(User $user, PaymentMethod $paymentMethod): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_PAYMENT_METHODS);
    }

    public function archive(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_PAYMENT_METHODS);
    }

    public function restore(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_PAYMENT_METHODS);
    }

    public function delete(User $user): bool
    {
        return $user->can(Permissions::MANAGE_SETTINGS_PAYMENT_METHODS);
    }
}
