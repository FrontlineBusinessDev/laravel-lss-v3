<?php

namespace App\Http\Controllers\v1\Trainer\Leave;

use App\Http\Controllers\v1\ApiController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends ApiController
{
    public function index(): Response
    {
        return Inertia::render('trainer/leave/index')->asCsr();
    }
}
