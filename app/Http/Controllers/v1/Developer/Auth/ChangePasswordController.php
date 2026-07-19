<?php

namespace App\Http\Controllers\v1\Developer\Auth;

use App\Http\Controllers\v1\Controller;
use App\Mail\PasswordChangedMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules\Password as PasswordRule;

/**
 * Self-service password change for a logged-in user (avatar menu → Change
 * password), distinct from the token-based AccountSetupController flow.
 */
class ChangePasswordController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user->forceFill([
            'password' => Hash::make($validated['password']),
        ])->save();

        Mail::to($user->email)->queue(new PasswordChangedMail($user));

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
            'data' => null,
        ]);
    }
}
