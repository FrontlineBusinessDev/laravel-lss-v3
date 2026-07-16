<?php

namespace App\Http\Controllers\v1\Trainer\Dashboard;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController
{
    public function index(): Response
    {
        return Inertia::render('trainer/dashboard/index')->asCsr();
    }
}
