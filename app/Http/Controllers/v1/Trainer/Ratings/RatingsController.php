<?php

namespace App\Http\Controllers\v1\Trainer\Ratings;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RatingsController
{
    public function index(): Response
    {
        return Inertia::render('trainer/ratings/index')->asCsr();
    }
}
