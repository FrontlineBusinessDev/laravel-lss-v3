<?php

namespace App\Http\Controllers\v1\Trainer\Trainees;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TraineesController
{
    public function index(): Response
    {
        return Inertia::render('trainer/trainees/index')->asCsr();
    }
}
