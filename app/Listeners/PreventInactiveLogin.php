<?php

// app/Listeners/PreventInactiveLogin.php

namespace App\Listeners;

use App\Models\User;
use Illuminate\Auth\Events\Attempting;
use Illuminate\Validation\ValidationException;

class PreventInactiveLogin
{
    public function handle(Attempting $event): void
    {
        $user = User::where('email', $event->credentials['email'] ?? null)->first();

        if ($user && ! $user->isActive()) {
            throw ValidationException::withMessages([
                'email' => 'This account has been archived. Please contact an administrator.',
            ]);
        }
    }
}
