<?php

namespace App\Http\Controllers\v1\Trainer\Announcements;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementsController
{
    public function index(): Response
    {
        return Inertia::render('trainer/announcements/index')->asCsr();
    }
}
