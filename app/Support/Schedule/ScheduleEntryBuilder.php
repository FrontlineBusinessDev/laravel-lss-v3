<?php

namespace App\Support\Schedule;

use App\Models\Batches;
use App\Models\Trainees;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Turns a collection of Batches (eager-loaded with academicIndustry,
 * academicProgram, and trainees.school + trainees' completed_hours) into the
 * schedule-entry payload consumed by the Schedule module's Timeline/Calendar
 * views, summary panel, and detail modal.
 */
class ScheduleEntryBuilder
{
    /** @return array<int, array<string, mixed>> */
    public static function build(Collection $batches): array
    {
        return $batches->map(fn(Batches $batch) => self::buildEntry($batch))->values()->all();
    }

    private static function buildEntry(Batches $batch): array
    {
        $start = $batch->date_started ?? $batch->projected_end_date;

        $end = ($start && $batch->trainees->isNotEmpty())
            ? $batch->trainees->reduce(
                fn($carry, Trainees $trainee) => max(
                    $carry,
                    ProjectedCompletionCalculator::forTrainee($trainee, $start)->timestamp,
                ),
                $start->timestamp,
            )
            : null;

        $schoolCounts = $batch->trainees
            ->groupBy(fn(Trainees $trainee) => $trainee->school?->school_name ?? 'Unassigned')
            ->map(fn(Collection $group, string $school) => ['school' => $school, 'count' => $group->count()])
            ->values()
            ->sortByDesc('count')
            ->values();

        return [
            'batch' => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'status' => $batch->status,
                'setup' => $batch->setup,
                'date_started' => $batch->date_started?->toDateString(),
                'projected_end_date' => $batch->projected_end_date?->toDateString(),
                'industry' => $batch->academicIndustry?->name,
                'program_type' => $batch->academicProgram?->name,
            ],
            'trainees' => $batch->trainees->map(fn(Trainees $trainee) => [
                'id' => $trainee->id,
                'name' => trim($trainee->first_name . ' ' . $trainee->last_name),
                'school' => $trainee->school?->school_name ?? 'Unassigned',
                'academic_program' => $batch->academicProgram?->name,
                'status' => $trainee->status,
            ])->values(),
            'start' => $start?->toDateString(),
            'end' => $end ? Carbon::createFromTimestamp($end)->toDateString() : $batch->projected_end_date?->toDateString(),
            'school_counts' => $schoolCounts,
            'primary_school' => $schoolCounts->first()['school'] ?? 'Unassigned',
            'programs' => array_values(array_filter([$batch->academicProgram?->name])),
        ];
    }
}
