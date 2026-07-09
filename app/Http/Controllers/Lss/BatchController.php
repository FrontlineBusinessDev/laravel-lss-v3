<?php

namespace App\Http\Controllers\Lss;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class BatchController extends Controller
{
    
    public function index(): Response
    {
        return Inertia::render('batches/index')->asCsr();
    }

    /**
     * The id is looked up client-side against resources/js/data/mockData.ts
     * (see BatchesContext) — no batches table exists yet.
     */
    public function show(string $id): Response
    {
        return Inertia::render('batches/detail', ['id' => $id])->asCsr();
    }
}
