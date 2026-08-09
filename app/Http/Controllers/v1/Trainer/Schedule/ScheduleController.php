<?php

namespace App\Http\Controllers\v1\Trainer\Schedule;

use App\Http\Controllers\v1\Controller;
use App\Models\Batches;
use App\Support\Schedule\ScheduleEntryBuilder;
use App\Traits\ScopesToAssignedBatches;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    use ScopesToAssignedBatches;

    /**
     * Yearly batch timeline & calendar, scoped to the trainer's assigned
     * batches only. Mirrors Developer\Schedule\ScheduleController — same
     * real-props pattern and ScheduleEntryBuilder, just a filtered query.
     */
    public function index(): Response
    {
        $batches = Batches::whereIn('id', $this->assignedBatchIds())
            ->with([
                'academicIndustry',
                'academicProgramType',
                'trainees' => fn ($query) => $query->withCompletedHours()->with(['school', 'academicProgram']),
            ])->get();

        return Inertia::render('trainer/schedule/index', [
            'entries' => ScheduleEntryBuilder::build($batches),
        ]);
    }
}
