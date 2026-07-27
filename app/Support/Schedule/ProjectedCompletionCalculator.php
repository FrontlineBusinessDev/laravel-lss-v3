<?php

namespace App\Support\Schedule;

use App\Models\Trainees;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;

/**
 * Projects when a trainee will finish their required hours, assuming an
 * 8 hours/day, Monday-Friday pace from the batch's start date. Used to build
 * batch timelines on the Schedule module since neither trainees nor batches
 * store an actual projected-completion date. Returns the real date instead
 * once the trainee has actually completed (Trainees.date_completed is set).
 */
class ProjectedCompletionCalculator
{
    private const HOURS_PER_DAY = 8;

    /**
     * Caller must eager-load `completed_hours` via Trainees::scopeWithCompletedHours().
     * $batchStart is typed as CarbonInterface since date casts resolve to CarbonImmutable.
     */
    public static function forTrainee(Trainees $trainee, CarbonInterface $batchStart): Carbon
    {
        if ($trainee->date_completed) {
            return Carbon::instance($trainee->date_completed);
        }

        $completedHours = (float) ($trainee->completed_hours ?? 0);
        $remaining = max(0, (float) $trainee->required_hours - $completedHours);
        $workingDays = (int) ceil($remaining / self::HOURS_PER_DAY);

        return Carbon::instance($batchStart)->addWeekdays($workingDays);
    }
}
