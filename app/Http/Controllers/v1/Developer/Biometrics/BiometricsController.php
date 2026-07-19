<?php

namespace App\Http\Controllers\v1\Developer\Biometrics;

use App\Http\Controllers\v1\Controller;
use App\Models\BiometricImport;
use App\Models\BiometricRecord;
use App\Support\BiometricHours;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BiometricsController extends Controller
{
    /** Static frontend shell — records are fetched client-side via the JSON actions below. */
    public function index(): Response
    {
        return Inertia::render('developer/biometrics/index')->asCsr();
    }

    public function records(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'batch_id' => ['nullable', 'integer'],
            'import_id' => ['nullable', 'string'],
            'search' => ['nullable', 'string', 'max:255'],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
        ]);

        $records = BiometricRecord::query()
            ->with(['trainee:id,first_name,last_name,batch_id', 'trainee.batch:id,batch_code'])
            ->when($validated['batch_id'] ?? null, fn($q, $batchId) => $q->whereHas(
                'trainee',
                fn($t) => $t->where('batch_id', $batchId),
            ))
            ->when($validated['search'] ?? null, fn($q, $term) => $q->whereHas(
                'trainee',
                fn($t) => $t->where(DB::raw("concat(first_name, ' ', last_name)"), 'like', "%{$term}%"),
            ))
            // whereDate(), not where(): the 'date' cast round-trips through storage as
            // "Y-m-d H:i:s", so a plain string '<=' comparison would corrupt range matches.
            ->when($validated['date_from'] ?? null, fn($q, $d) => $q->whereDate('date', '>=', $d))
            ->when($validated['date_to'] ?? null, fn($q, $d) => $q->whereDate('date', '<=', $d))
            ->when(($validated['import_id'] ?? null) === 'latest', function ($q) {
                $latestId = BiometricImport::max('id');
                $q->where('biometric_import_id', $latestId);
            })
            ->when(
                ! empty($validated['import_id']) && ! in_array($validated['import_id'], ['latest', 'all'], true),
                fn($q) => $q->where('biometric_import_id', $validated['import_id']),
            )
            ->orderByDesc('date')
            ->get()
            ->map(fn(BiometricRecord $r) => $this->transformRecord($r));

        return response()->json(['success' => true, 'data' => $records]);
    }

    public function imports(): JsonResponse
    {
        $imports = BiometricImport::query()
            ->with('importedBy:id,first_name,last_name')
            ->latest()
            ->get()
            ->map(fn(BiometricImport $i) => [
                'id' => $i->id,
                'file_name' => $i->file_name,
                'imported_by' => trim($i->importedBy?->first_name . ' ' . $i->importedBy?->last_name),
                'imported_at' => $i->created_at->toDateString(),
                'total_rows' => $i->total_rows,
                'success_count' => $i->success_count,
                'error_count' => $i->error_count,
                'status' => $i->status,
            ]);

        return response()->json(['success' => true, 'data' => $imports]);
    }

    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => ['required', 'string', 'max:255'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.trainee_id' => ['required', 'integer', 'exists:app_trainees,id'],
            'rows.*.date' => ['required', 'date_format:Y-m-d'],
            'rows.*.morning_time_in' => ['nullable', 'date_format:H:i'],
            'rows.*.lunch_time_out' => ['nullable', 'date_format:H:i'],
            'rows.*.afternoon_time_in' => ['nullable', 'date_format:H:i'],
            'rows.*.day_time_out' => ['nullable', 'date_format:H:i'],
            'rows.*.on_leave' => ['nullable', 'boolean'],
            'rows.*.remarks' => ['nullable', 'string'],
            'total_rows' => ['required', 'integer', 'min:1'],
            'error_count' => ['required', 'integer', 'min:0'],
        ]);

        return DB::transaction(function () use ($validated) {
            $traineeIds = collect($validated['rows'])->pluck('trainee_id')->unique();
            $existingKeys = BiometricRecord::whereIn('trainee_id', $traineeIds)
                ->get(['trainee_id', 'date'])
                ->map(fn($r) => $r->trainee_id . '_' . $r->date->format('Y-m-d'))
                ->flip();

            $import = BiometricImport::create([
                'file_name' => $validated['file_name'],
                'imported_by_id' => auth()->id(),
                'total_rows' => $validated['total_rows'],
                'success_count' => 0,
                'error_count' => $validated['error_count'],
                'status' => 'failed',
            ]);

            $seen = [];
            $created = 0;
            $skipped = 0;

            foreach ($validated['rows'] as $row) {
                $key = $row['trainee_id'] . '_' . $row['date'];
                if (isset($seen[$key]) || isset($existingKeys[$key])) {
                    $skipped++;
                    continue;
                }
                $seen[$key] = true;

                BiometricRecord::create([
                    'trainee_id' => $row['trainee_id'],
                    'biometric_import_id' => $import->id,
                    'date' => $row['date'],
                    'morning_time_in' => $row['morning_time_in'] ?? null,
                    'lunch_time_out' => $row['lunch_time_out'] ?? null,
                    'afternoon_time_in' => $row['afternoon_time_in'] ?? null,
                    'day_time_out' => $row['day_time_out'] ?? null,
                    'on_leave' => $row['on_leave'] ?? false,
                    'remarks' => $row['remarks'] ?? null,
                ]);
                $created++;
            }

            $totalIssues = $skipped + $validated['error_count'];
            $import->update([
                'success_count' => $created,
                'status' => $created === 0 ? 'failed' : ($totalIssues > 0 ? 'partial' : 'success'),
            ]);

            return response()->json(['success' => true, 'data' => [
                'import' => $import->fresh(),
                'created_count' => $created,
                'skipped_count' => $skipped,
            ]]);
        });
    }

    public function updateRecord(Request $request, int|string $id): JsonResponse
    {
        $record = BiometricRecord::findOrFail($id);

        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'morning_time_in' => ['nullable', 'date_format:H:i'],
            'lunch_time_out' => ['nullable', 'date_format:H:i'],
            'afternoon_time_in' => ['nullable', 'date_format:H:i'],
            'day_time_out' => ['nullable', 'date_format:H:i'],
            'on_leave' => ['required', 'boolean'],
            'remarks' => ['nullable', 'string'],
        ]);

        if ($validated['on_leave']) {
            $validated['morning_time_in'] = null;
            $validated['lunch_time_out'] = null;
            $validated['afternoon_time_in'] = null;
            $validated['day_time_out'] = null;
        }

        $record->update($validated);

        return response()->json(['success' => true, 'data' => $this->transformRecord($record->fresh(['trainee', 'trainee.batch']))]);
    }

    public function deleteRecord(int|string $id): JsonResponse
    {
        BiometricRecord::findOrFail($id)->delete();

        return response()->json(null, 204);
    }

    private function transformRecord(BiometricRecord $record): array
    {
        return [
            'id' => $record->id,
            'trainee_id' => $record->trainee_id,
            'trainee_name' => trim($record->trainee?->first_name . ' ' . $record->trainee?->last_name),
            'batch_id' => $record->trainee?->batch_id,
            'batch_code' => $record->trainee?->batch?->batch_code,
            'date' => $record->date->toDateString(),
            'morning_time_in' => $this->shortTime($record->morning_time_in),
            'lunch_time_out' => $this->shortTime($record->lunch_time_out),
            'afternoon_time_in' => $this->shortTime($record->afternoon_time_in),
            'day_time_out' => $this->shortTime($record->day_time_out),
            'on_leave' => $record->on_leave,
            'remarks' => $record->remarks,
            'total_hours' => BiometricHours::totalHours($record),
            'exceptions' => BiometricHours::exceptions($record),
            'import_id' => $record->biometric_import_id,
        ];
    }

    /** DB `time` columns round-trip as "HH:MM:SS" — trim to "HH:MM" for the frontend's <input type="time"> fields. */
    private function shortTime(?string $value): ?string
    {
        return $value === null ? null : substr($value, 0, 5);
    }
}
