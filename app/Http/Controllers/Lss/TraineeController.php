<?php

namespace App\Http\Controllers\Lss;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class TraineeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('trainees/index');
    }

    /**
     * The id is looked up client-side against resources/js/data/mockData.ts
     * — no trainees table exists yet.
     */
    public function show(string $id): Response
    {
        return Inertia::render('trainees/detail', ['id' => $id])->asCsr();
    }
}
