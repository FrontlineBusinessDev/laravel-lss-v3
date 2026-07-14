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
        if ($request->user() === null) {
            return redirect()->route('login');
        }

        return redirect()->route('dashboard');
    }
}
