<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\AcademicIndustry;
use App\Models\AcademicProgramType;
use App\Models\Batches;
use App\Support\Import\ImportLogging;
use App\Support\Statuses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Phase 3 — legacy lcssv2_batch onto app_batches. Reuses the legacy
 * `batch_number` verbatim as batch_code (legacy occupied 1..75; the live
 * generator in BatchesController never emits below 76, so no collision risk
 * — see BatchesController::BATCH_SEQUENCE_START).
 */
class BatchImportController extends Controller implements HasMiddleware
{
    use ImportLogging;

    /** Mirrors BatchesController::BATCH_SEQUENCE_START — codes at/above this are reserved for live auto-generation. */
    private const RESERVED_SEQUENCE_START = 76;

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    /** POST /settings/import/batches — rows: [{batch_code, setup, industry, program_type, date_started, projected_end_date?, is_open, is_completed, is_dissolved}] */
    public function import(Request $request): JsonResponse
    {
        $this->nullifyBlankRowFields($request, ['projected_end_date']);
        $this->normalizeDateRowFields($request, ['date_started', 'projected_end_date']);

        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
        ]);

        $rowRules = [
            'batch_code' => ['required', 'string', 'max:50'],
            'setup' => ['required', 'string', 'in:f2f,online'],
            'industry' => ['required', 'string'],
            'program_type' => ['required', 'string'],
            'date_started' => ['required', 'date'],
            'projected_end_date' => ['nullable', 'date'],
            'is_open' => ['nullable'],
            'is_completed' => ['nullable'],
            'is_dissolved' => ['nullable'],
        ];

        $errors = [];
        $warnings = [];
        $successCount = 0;
        $createdIds = [];

        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            if ($error = $this->validateRow($row, $rowRules)) {
                $errors[] = "Row {$rowNum}: {$error}";
                continue;
            }
            $code = trim($row['batch_code']);

            if (Batches::where('batch_code', $code)->exists()) {
                $errors[] = "Row {$rowNum}: batch_code \"{$code}\" already exists — skipped.";
                continue;
            }

            if (preg_match('/(\d+)$/', $code, $m) && (int) $m[1] >= self::RESERVED_SEQUENCE_START) {
                $warnings[] = "Row {$rowNum}: batch_code \"{$code}\" is at/above the reserved auto-generation threshold ({$this->reservedStartLabel()}) — may collide with a future system-generated batch.";
            }

            $industry = AcademicIndustry::whereRaw('LOWER(name) = ?', [mb_strtolower(trim($row['industry']))])->first();
            $programType = AcademicProgramType::whereRaw('LOWER(name) = ?', [mb_strtolower(trim($row['program_type']))])->first();
            if (! $industry) {
                $errors[] = "Row {$rowNum}: industry \"{$row['industry']}\" not found — run the Academic Reference Data import first.";
                continue;
            }
            if (! $programType) {
                $errors[] = "Row {$rowNum}: program type \"{$row['program_type']}\" not found — run the Academic Reference Data import first.";
                continue;
            }

            try {
                $batch = DB::transaction(fn () => Batches::create([
                    'status' => $this->resolveStatus($row),
                    'batch_code' => $code,
                    'public_registration_url_id' => (string) Str::ulid(),
                    'is_public_url_enable' => false,
                    'date_started' => $row['date_started'],
                    'projected_end_date' => $row['projected_end_date'] ?? null,
                    'setup' => $row['setup'],
                    'academic_industry_id' => $industry->id,
                    'academic_program_type_id' => $programType->id,
                ]));
                $createdIds[] = ['model' => Batches::class, 'id' => $batch->id];
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('batches', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, $warnings, $createdIds);
    }

    /** Collapses legacy's 3 booleans onto the current single status string. Dissolved wins, then completed, then open/default active. */
    private function resolveStatus(array $row): string
    {
        if ($this->truthy($row['is_dissolved'] ?? null)) {
            return Statuses::TERMINATED;
        }
        if ($this->truthy($row['is_completed'] ?? null)) {
            return Statuses::INACTIVE;
        }

        return Statuses::ACTIVE;
    }

    private function truthy(mixed $value): bool
    {
        return in_array(is_string($value) ? strtolower(trim($value)) : $value, [1, '1', true, 'true', 'yes'], true);
    }

    private function reservedStartLabel(): string
    {
        return 'FBS-' . str_pad((string) self::RESERVED_SEQUENCE_START, 3, '0', STR_PAD_LEFT);
    }
}
