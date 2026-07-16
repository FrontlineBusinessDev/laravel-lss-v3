<?php

namespace App\Http\Controllers\v1\Trainee\Biometrics;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BiometricsController
{
    public function index(): Response
    {
        return Inertia::render('trainee/biometrics/index')->asCsr();
    }
}
