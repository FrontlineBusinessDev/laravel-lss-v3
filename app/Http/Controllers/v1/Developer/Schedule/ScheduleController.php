<?php

namespace App\Http\Controllers\v1\Developer\Schedule;

use App\Http\Controllers\v1\Controller;
use App\Models\Batches;
use App\Support\Schedule\ScheduleEntryBuilder;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    /**
     * Yearly batch timeline & calendar. Renders with real props (unlike the
     * Dashboard's CSR-plus-per-widget-fetch pattern) since every view on this
     * page — Timeline, Calendar, filters, summary panel — derives from the
     * same single dataset of schedule entries.
     */
    public function index(): Response
    {
        $batches = Batches::with([
            'academicIndustry',
            'academicProgram',
            'trainees' => fn($query) => $query->withCompletedHours()->with('school'),
        ])->get();

        return Inertia::render('developer/schedule/index', [
            'entries' => ScheduleEntryBuilder::build($batches),
        ]);
    }
}
