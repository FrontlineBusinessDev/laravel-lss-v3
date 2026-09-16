<?php

namespace App\Http\Controllers\v1\Trainer\Ratings;

use App\Http\Controllers\v1\ApiController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RatingsController extends ApiController
{
    public function index(): Response
    {
        return Inertia::render('trainer/ratings/index')->asCsr();
    }
}
