<?php

namespace App\Http\Controllers\v1\Developer\Auth;

use App\Http\Controllers\v1\Developer\Controller;
use App\Http\Responses\InertiaPageResponse;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

/**
 * Completion side of the admin-triggered password reset / first-time account
 * setup. The link mailed by UserController@sendPasswordReset (built by
 * App\Support\PasswordSetupUrl) lands here carrying a single-use broker token.
 * Uses the password broker directly rather than Fortify, which stays disabled
 * for this build (config/fortify.php).
 */
class AccountSetupController extends Controller
{
    /** Render the set-password page with the token + prefilled email. */
    public function edit(Request $request, string $token): mixed
    {
        return InertiaPageResponse::csr('auth/reset-password', [
            'token' => $token,
            'email' => (string) $request->query('email', ''),
        ]);
    }

    /** Consume the token and set the new password via the password broker. */
    public function update(Request $request, string $token): RedirectResponse
    {
        $request->merge(['token' => $token]);

        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        // Broker verifies the user + single-use token, then invokes the callback
        // to persist the hash; the token is invalidated on success (no replay).
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }

        return redirect()->route('login')->with('status', __($status));
    }
}
