<?php

namespace App\Http\Controllers\v1\Developer\Report;

use App\Http\Controllers\v1\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Static frontend page. Data for this module lives client-side in
     * resources/js/data/mockData.ts — see class docblock in that file.
     */
    public function index(): Response
    {
        return Inertia::render('developer/reports/index')->asCsr();
    }
}
