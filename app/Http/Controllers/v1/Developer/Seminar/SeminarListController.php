<?php

namespace App\Http\Controllers\v1\Developer\Seminar;

use App\Http\Controllers\v1\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SeminarListController extends Controller
{
    /**
     * Static frontend page. Data for this module lives client-side in
     * resources/js/data/mockData.ts — see class docblock in that file.
     */
    public function index(): Response
    {
        return Inertia::render('developer/seminar/index')->asCsr();
    }
}
