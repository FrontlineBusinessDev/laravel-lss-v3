<?php

namespace App\Http\Controllers\v1\Trainee\Tasks;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TasksController
{
    public function index(): Response
    {
        return Inertia::render('trainee/tasks/index')->asCsr();
    }
}
