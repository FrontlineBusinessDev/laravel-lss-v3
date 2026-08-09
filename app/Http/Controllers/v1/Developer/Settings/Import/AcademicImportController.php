<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\AcademicIndustry;
use App\Models\AcademicLevel;
use App\Models\AcademicProgram;
use App\Models\AcademicProgramType;
use App\Support\Import\ImportLogging;
use App\Support\Statuses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

/**
 * Phase 1 — legacy academic reference data (industry/program/level/program-type)
 * onto app_settings_academic_*. Match-or-create by exact (case-insensitive)
 * `name`, per the approved import plan.
 */
class AcademicImportController extends Controller implements HasMiddleware
{
    use ImportLogging;

    private const MODELS = [
        'industry' => AcademicIndustry::class,
        'program' => AcademicProgram::class,
        'level' => AcademicLevel::class,
        'program-type' => AcademicProgramType::class,
    ];

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    /** POST /settings/import/academic/{type} — rows: [{name, abbreviation?, description?}] */
    public function import(Request $request, string $type): JsonResponse
    {
        abort_unless(array_key_exists($type, self::MODELS), 404);
        $modelClass = self::MODELS[$type];

        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.name' => ['required', 'string', 'max:255'],
            'rows.*.abbreviation' => ['nullable', 'string', 'max:50'],
            'rows.*.description' => ['nullable', 'string'],
        ]);

        $errors = [];
        $successCount = 0;

        // Each row isolated in its own transaction so one bad row can't roll
        // back rows already successfully matched/created earlier in the batch.
        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            $name = trim($row['name']);
            if ($name === '') {
                $errors[] = "Row {$rowNum}: name is required.";
                continue;
            }

            try {
                $existing = $modelClass::whereRaw('LOWER(name) = ?', [mb_strtolower($name)])->first();
                if ($existing) {
                    $successCount++;
                    continue;
                }

                $payload = ['status' => Statuses::ACTIVE, 'name' => $name];
                if (! empty($row['abbreviation']) && $this->hasColumn($modelClass, 'abbreviation')) {
                    $payload['abbreviation'] = $row['abbreviation'];
                }
                if (! empty($row['description']) && $this->hasColumn($modelClass, 'description')) {
                    $payload['description'] = $row['description'];
                }

                DB::transaction(fn () => $modelClass::create($payload));
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport("academic_{$type}", $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors);
    }

    private function hasColumn(string $modelClass, string $column): bool
    {
        return in_array($column, (new $modelClass)->getFillable(), true);
    }
}
