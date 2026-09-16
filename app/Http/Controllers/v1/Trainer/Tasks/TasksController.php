<?php

namespace App\Http\Controllers\v1\Trainer\Tasks;

use App\Http\Controllers\v1\ApiController;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TasksController extends ApiController
{
    public function index(): Response
    {
        return Inertia::render('trainer/tasks/index')->asCsr();
    }
}
