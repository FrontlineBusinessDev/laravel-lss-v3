<?php

namespace App\Http\Controllers\v1\Developer\Leave;

use App\Http\Controllers\v1\Developer\Controller;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    /**
     * Static frontend page. Data for this module lives client-side in
     * resources/js/data/mockData.ts — see class docblock in that file.
     */
    public function index(): Response
    {
        return Inertia::render('developer/leave/index')->asCsr();
    }
}
