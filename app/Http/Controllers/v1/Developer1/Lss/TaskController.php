<?php

namespace App\Http\Controllers\v1\Developer\Lss;

use App\Http\Controllers\v1\Developer\Controller;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    /**
     * Static frontend page. Data for this module lives client-side in
     * resources/js/data/mockData.ts — see class docblock in that file.
     */
    public function index(): Response
    {
        return Inertia::render('developer/tasks/index')->asCsr();
    }
}
