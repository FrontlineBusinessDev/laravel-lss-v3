<?php

namespace App\Http\Controllers\v1\Developer\Dashboard;

use App\Http\Controllers\v1\Developer\Controller;
use App\Models\Notification;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Mostly a static frontend page — data for this module otherwise lives
     * client-side in resources/js/data/mockData.ts (see that file's class
     * docblock) — except for `pendingRegistrationsCount`, a deliberate,
     * narrow exception wiring one real widget (pending public registrations)
     * to the DB rather than waiting for a full dashboard rebuild.
     */
    public function index(): Response
    {
        $pendingRegistrationsCount = Notification::where('user_id', auth()->id())
            ->where('type', 'registration.submitted')
            ->whereNull('read_at')
            ->count();

        return Inertia::render('developer/dashboard/index', [
            'pendingRegistrationsCount' => $pendingRegistrationsCount,
        ])->asCsr();
    }
}
