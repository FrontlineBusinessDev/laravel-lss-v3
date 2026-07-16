<?php

namespace App\Http\Controllers\v1\Trainer\Leave;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController
{
    public function index(): Response
    {
        return Inertia::render('trainer/leave/index')->asCsr();
    }
}
