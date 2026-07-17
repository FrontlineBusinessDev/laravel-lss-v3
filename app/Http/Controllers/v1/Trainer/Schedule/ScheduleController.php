<?php

namespace App\Http\Controllers\v1\Trainer\Schedule;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController
{
    public function index(): Response
    {
        return Inertia::render('trainer/schedule/index')->asCsr();
    }
}
