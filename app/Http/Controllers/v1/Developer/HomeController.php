<?php

namespace App\Http\Controllers\v1\Developer;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    /**
     * Landing dispatcher for `/`.
     * Guests -> login. Authenticated users -> dashboard.
     */
    public function index(Request $request): RedirectResponse
    {
        $user = $request->user();
        if ($user === null) {
            return redirect()->route('login');
        }

        return match (true) {
            $user->hasRole('trainer') => redirect()->route('trainer.dashboard'),
            $user->hasRole('trainee') => redirect()->route('trainee.dashboard'),
            default => redirect()->route('dashboard'),
        };
    }
}
