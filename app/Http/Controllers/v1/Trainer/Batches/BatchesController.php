<?php

namespace App\Http\Controllers\v1\Trainer\Batches;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BatchesController
{
    public function index(): Response
    {
        return Inertia::render('trainer/batches/index')->asCsr();
    }
}
