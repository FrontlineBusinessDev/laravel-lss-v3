<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LssLoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        if ($request->wantsJson()) {
            return response()->json(['two_factor' => false]);
        }

        $user = $request->user();
        $target = match (true) {
            $user->hasRole('trainer') => route('trainer.dashboard'),
            $user->hasRole('trainee') => route('trainee.dashboard'),
            default => route('dashboard'),
        };

        return redirect()->intended($target);
    }
}
