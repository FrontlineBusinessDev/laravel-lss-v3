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
     * consumes the plaintext token ForgotPasswordController gets back from
     * Password::broker()->sendResetLink() — so we never create a second token.
     * Lands on the same /invitation/{token} completion route as the admin
     * invite flow (AccountSetupController), which only cares that the token +
     * email resolve via the password broker, not which flow minted it.
     */
    public static function generate(User $user, string $token): string
    {
        return URL::to('/invitation/'.$token.'?email='.urlencode($user->email));
    }
}
