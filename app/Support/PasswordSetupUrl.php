<?php

// app/Support/PasswordSetupUrl.php

namespace App\Support;

use App\Models\User;
use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\URL;

class PasswordSetupUrl
{
    public static function generate(User $user): string
    {
        /** @var PasswordBroker $broker */
        $broker = Password::broker();

        // A single-use password-broker token (hashed at rest, expires per
        // config/auth.php `passwords.users.expire`). It is invalidated the
        // moment the password is set — see AccountSetupController::setupPassword —
        // so the link cannot be tampered with or replayed afterwards.
        $token = $broker->createToken($user);

        // Lands on the unified login/onboarding page with the email prefilled and
        // the token in hand, jumping the user straight to the create-password step.
        return URL::to('/invitation/'.$token.'?email='.urlencode($user->email));
    }
}
