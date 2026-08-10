<?php

namespace App\Http\Controllers\v1\Trainee\Biometrics;

use App\Models\BiometricRecord;
use App\Models\Trainees;
use App\Support\BiometricHours;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Read-only attendance log for the logged-in trainee — mirrors Developer\Trainees\TraineeBiometricsController but scoped to auth()->id() instead of an {id} route param. */
class BiometricsController
{
    public function index(): Response
    {
        $trainee = $this->resolveOwnTrainee();
        $trainee->load(['school:id,school_name', 'batch:id,batch_code']);

        return Inertia::render('trainee/biometrics/index', [
            'trainee' => [
                'name' => trim("{$trainee->first_name} {$trainee->last_name}"),
                'school' => $trainee->school?->school_name,
                'batch_code' => $trainee->batch?->batch_code,
            ],
        ])->asCsr();
    }

    /** GET /trainee/biometrics-data */
    public function records(Request $request): JsonResponse
    {
        $trainee = $this->resolveOwnTrainee();

        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ]);

        // whereDate(), not where(): the 'date' cast round-trips through storage as
        // "Y-m-d H:i:s", so a plain string '<=' comparison would corrupt range matches.
        $records = BiometricRecord::where('trainee_id', $trainee->id)
            ->when($validated['start_date'] ?? null, fn ($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($validated['end_date'] ?? null, fn ($q, $d) => $q->whereDate('date', '<=', $d))
            ->orderByDesc('date')
            ->get();

        $rows = $records->map(fn (BiometricRecord $r) => [
            'id' => $r->id,
            'date' => $r->date->toDateString(),
            'morning_time_in' => $this->shortTime($r->morning_time_in),
            'lunch_time_out' => $this->shortTime($r->lunch_time_out),
            'afternoon_time_in' => $this->shortTime($r->afternoon_time_in),
            'day_time_out' => $this->shortTime($r->day_time_out),
            'on_leave' => $r->on_leave,
            'remarks' => $r->remarks,
            'total_hours' => BiometricHours::totalHours($r),
            'exceptions' => BiometricHours::exceptions($r),
        ]);

        return response()->json(['success' => true, 'data' => [
            'records' => $rows,
            'summary' => [
                'total_days' => $rows->count(),
                'total_hours' => round($rows->sum('total_hours'), 2),
                'exceptions_count' => $rows->filter(fn ($row) => count($row['exceptions']) > 0)->count(),
            ],
        ]]);
    }

    private function shortTime(?string $value): ?string
    {
        return $value === null ? null : substr($value, 0, 5);
    }

    private function resolveOwnTrainee(): Trainees
    {
        return Trainees::where('user_id', auth()->id())->firstOrFail();
    }
}
