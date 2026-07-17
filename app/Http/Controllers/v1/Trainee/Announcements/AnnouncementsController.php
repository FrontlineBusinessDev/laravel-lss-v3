<?php

namespace App\Http\Controllers\v1\Trainee\Announcements;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementsController
{
    public function index(): Response
    {
        return Inertia::render('trainee/announcements/index')->asCsr();
    }
}
