<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\AcademicLevel;
use App\Models\AcademicProgram;
use App\Models\Batches;
use App\Models\PartnerSchools;
use App\Models\Trainees;
use App\Support\Import\ImportLogging;
use App\Support\Statuses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Phase 4 — legacy lcssv2_trainee onto app_trainees. Cross-links to Phases
 * 1-3 by name (school/program/level) and batch_code. Legacy per-trainee rate
 * figures are preserved via the override_* columns so TraineeObserver's
 * billing recomputation reproduces them instead of pulling today's rates.
 */
class TraineeImportController extends Controller implements HasMiddleware
{
    use ImportLogging;

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.first_name' => ['required', 'string', 'max:255'],
            'rows.*.last_name' => ['required', 'string', 'max:255'],
            'rows.*.email' => ['required', 'email', 'max:255'],
            'rows.*.batch_code' => ['required', 'string'],
            'rows.*.school_name' => ['required', 'string'],
            'rows.*.program_name' => ['nullable', 'string'],
            'rows.*.level_name' => ['nullable', 'string'],
            'rows.*.gender' => ['required', 'string'],
            'rows.*.birthday' => ['nullable', 'date'],
            'rows.*.birth_place' => ['nullable', 'string'],
            'rows.*.address' => ['nullable', 'string'],
            'rows.*.mobile_number' => ['nullable', 'string'],
            'rows.*.emergency_contact_name' => ['nullable', 'string'],
            'rows.*.emergency_contact_number' => ['nullable', 'string'],
            'rows.*.required_hours' => ['required', 'numeric', 'min:0'],
            'rows.*.f2f_hours_rate' => ['nullable', 'numeric'],
            'rows.*.online_hours_rate' => ['nullable', 'numeric'],
            'rows.*.discount_percent' => ['nullable', 'numeric'],
            'rows.*.is_active' => ['nullable'],
        ]);

        $errors = [];
        $successCount = 0;

        // Each row is its own transaction: app_trainees.birthday and other
        // columns are NOT NULL, and a bad row's constraint violation must
        // only roll back that row, not every row already imported this batch.
        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            $email = trim($row['email']);
            $gender = strtolower(trim($row['gender']));

            if (! in_array($gender, ['male', 'female'], true)) {
                $errors[] = "Row {$rowNum}: gender \"{$row['gender']}\" is not male/female — skipped.";
                continue;
            }
            if (empty($row['birthday'])) {
                $errors[] = "Row {$rowNum}: birthday is required (app_trainees.birthday is NOT NULL) — skipped.";
                continue;
            }
            if (Trainees::where('email', $email)->exists()) {
                $errors[] = "Row {$rowNum}: a trainee with email \"{$email}\" already exists — skipped.";
                continue;
            }

            $batch = Batches::where('batch_code', trim($row['batch_code']))->first();
            if (! $batch) {
                $errors[] = "Row {$rowNum}: batch \"{$row['batch_code']}\" not found — run the Batches import first.";
                continue;
            }
            $school = PartnerSchools::whereRaw('LOWER(school_name) = ?', [mb_strtolower(trim($row['school_name']))])->first();
            if (! $school) {
                $errors[] = "Row {$rowNum}: school \"{$row['school_name']}\" not found — run the Partner Schools import first.";
                continue;
            }

            $program = ! empty($row['program_name'])
                ? AcademicProgram::whereRaw('LOWER(name) = ?', [mb_strtolower(trim($row['program_name']))])->first()
                : null;
            $level = ! empty($row['level_name'])
                ? AcademicLevel::whereRaw('LOWER(name) = ?', [mb_strtolower(trim($row['level_name']))])->first()
                : null;

            $rate = $batch->setup === 'online' ? ($row['online_hours_rate'] ?? null) : ($row['f2f_hours_rate'] ?? null);

            try {
                DB::transaction(fn () => Trainees::create([
                    'status' => $this->truthy($row['is_active'] ?? 1) ? Statuses::ACTIVE : Statuses::INACTIVE,
                    'batch_id' => $batch->id,
                    'school_id' => $school->id,
                    'academic_program_id' => $program?->id,
                    'academic_level_id' => $level?->id,
                    'public_url_id' => (string) Str::ulid(),
                    'first_name' => trim($row['first_name']),
                    'last_name' => trim($row['last_name']),
                    'email' => $email,
                    'birthday' => $row['birthday'],
                    'birth_place' => $row['birth_place'] ?? '',
                    'gender' => $gender,
                    'mobile_number' => $row['mobile_number'] ?? '',
                    'emergency_contact_name' => $row['emergency_contact_name'] ?? '',
                    'emergency_contact_number' => $row['emergency_contact_number'] ?? '',
                    'required_hours' => $row['required_hours'],
                    'address' => $row['address'] ?? '',
                    'override_rate_per_hour' => $rate !== null && $rate !== '' ? (float) $rate : null,
                    'override_hours_discount_percent' => isset($row['discount_percent']) && $row['discount_percent'] !== ''
                        ? (float) $row['discount_percent']
                        : null,
                ]));
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('trainees', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors);
    }

    private function truthy(mixed $value): bool
    {
        return in_array(is_string($value) ? strtolower(trim($value)) : $value, [1, '1', true, 'true', 'yes'], true);
    }
}
