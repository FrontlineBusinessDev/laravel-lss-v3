<?php

// app/Support/PasswordResetUrl.php

namespace App\Support;

use App\Models\User;
use Illuminate\Support\Facades\URL;

class PasswordResetUrl
{
    /**
     * Build the reset-password link for an already-issued broker token.
     *
     * Unlike PasswordSetupUrl (which mints a fresh token for invitations), this
     * consumes the plaintext token Fortify passes to
     * User::sendPasswordResetNotification() — so we never create a second token.
     * Lands on Fortify's password.reset route, which App\Providers\
     * FortifyServiceProvider gates on Password::broker()->tokenExists().
     */
    public static function generate(User $user, string $token): string
    {
        return URL::to('/reset-password/'.$token.'?email='.urlencode($user->email));
    }
}
