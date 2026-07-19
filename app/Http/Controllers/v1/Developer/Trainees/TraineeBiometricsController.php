<?php

namespace App\Http\Controllers\v1\Developer\Trainees;

use App\Models\BiometricRecord;
use App\Models\Trainees;
use App\Support\BiometricHours;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TraineeBiometricsController extends Controller
{
    use AuthorizesRequests;

    /** Read-only, filtered biometric log for the trainee detail tab (GET /trainees/{id}/biometrics-data). */
    public function records(Request $request, int|string $id): JsonResponse
    {
        $trainee = Trainees::findOrFail($id);
        $this->authorize('view', $trainee);

        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
            // A trainee has exactly one batch today; accepted for spec-completeness
            // and forward-compat with multi-enrollment, but must match if provided.
            'training_period_id' => ['nullable', 'integer'],
        ]);

        abort_if(
            isset($validated['training_period_id']) && (int) $validated['training_period_id'] !== $trainee->batch_id,
            422,
            "training_period_id does not match this trainee's batch.",
        );

        // whereDate(), not where(): the 'date' cast round-trips through storage as
        // "Y-m-d H:i:s", so a plain string '<=' comparison would corrupt range matches.
        $records = BiometricRecord::where('trainee_id', $id)
            ->when($validated['start_date'] ?? null, fn($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($validated['end_date'] ?? null, fn($q, $d) => $q->whereDate('date', '<=', $d))
            ->orderByDesc('date')
            ->get();

        $rows = $records->map(fn(BiometricRecord $r) => [
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
                'exceptions_count' => $rows->filter(fn($row) => count($row['exceptions']) > 0)->count(),
            ],
        ]]);
    }

    private function shortTime(?string $value): ?string
    {
        return $value === null ? null : substr($value, 0, 5);
    }
}
