<?php

namespace App\Http\Controllers\v1\Trainee\Evaluations;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationsController
{
    public function index(): Response
    {
        return Inertia::render('trainee/evaluation/index')->asCsr();
    }
}
