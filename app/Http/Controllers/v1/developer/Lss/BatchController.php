<?php

namespace App\Http\Controllers\v1\developer\Lss;

use App\Http\Controllers\v1\developer\Controller;
use Inertia\Inertia;
use Inertia\Response;

class BatchController extends Controller
{

    public function index(): Response
    {
        return Inertia::render('developer/batches/index')->asCsr();
    }

    /**
     * The id is looked up client-side against resources/js/data/mockData.ts
     * (see BatchesContext) — no batches table exists yet.
     */
    public function show(string $id): Response
    {
        return Inertia::render('developer/batches/detail', ['id' => $id])->asCsr();
    }
}
