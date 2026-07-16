<?php

namespace App\Http\Controllers\v1\Trainer\Tasks;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TasksController
{
    public function index(): Response
    {
        return Inertia::render('trainer/tasks/index')->asCsr();
    }
}
