<?php

namespace App\Http\Controllers\Lss;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    /**
     * Static frontend page. Data for this module lives client-side in
     * resources/js/data/mockData.ts — see class docblock in that file.
     */
    public function index(): Response
    {
        return Inertia::render('announcements/index')->asCsr();
    }
}
