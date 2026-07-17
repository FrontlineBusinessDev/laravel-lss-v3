<?php

namespace App\Http\Controllers\v1\Developer\Auth;

use App\Http\Controllers\v1\Developer\Controller;
use App\Mail\ForgotPasswordMail;
use App\Models\User;
use App\Support\PasswordResetUrl;
use App\Support\Statuses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;

/**
 * Public, unauthenticated "Forgot password" flow. Uses the password broker
 * directly (same as AccountSetupController/UserController@sendPasswordReset)
 * rather than Fortify's own reset feature, which stays disabled for this
 * build (config/fortify.php).
 */
class ForgotPasswordController extends Controller
{
    /**
     * Always responds with a generic success message regardless of whether
     * the email matches an account, so this endpoint can't be used to
     * enumerate registered users.
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Archived accounts can't log in anyway, and mirrors the admin-side
        // sendPasswordReset() guard. The response stays generic either way.
        if ($user && $user->status === Statuses::ACTIVE) {
            $token = Password::broker()->createToken($user);
            $resetUrl = PasswordResetUrl::generate($user, $token);
            Mail::to($user->email)->queue(new ForgotPasswordMail($user, $resetUrl));
        }

        return response()->json([
            'success' => true,
            'message' => "If an account exists for that email, we've sent a password reset link.",
            'data' => null,
        ]);
    }
}
