<?php

namespace App\Http\Controllers\v1\Developer\Leave;

use App\Http\Controllers\v1\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('developer/leave/index')->asCsr();
    }
}
