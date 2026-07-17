<?php

namespace App\Http\Controllers\v1\Developer\Ratings;

use App\Http\Controllers\v1\Developer\Controller;
use Inertia\Inertia;
use Inertia\Response;

class RatingController extends Controller
{
    /**
     * Behavioral Rating — static frontend page. Data for this module lives
     * client-side in resources/js/data/mockData.ts — see class docblock in
     * that file. Task Rating (the /ratings default) is now real/DB-backed,
     * see TaskRatingController.
     */
    public function index(): Response
    {
        return Inertia::render('developer/ratings/behavioral-rating')->asCsr();
    }
}
