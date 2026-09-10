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
        $this->nullifyBlankRowFields($request, ['birthday']);
        $this->normalizeDateRowFields($request, ['birthday']);

        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
        ]);

        $rowRules = array_merge([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'batch_code' => ['required', 'string'],
            'school_name' => ['nullable', 'string'],
            'program_name' => ['nullable', 'string'],
            'level_name' => ['nullable', 'string'],
            'gender' => ['nullable', 'string'],
            'birthday' => ['nullable', 'date'],
            'birth_place' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'mobile_number' => ['nullable', 'string'],
            'emergency_contact_name' => ['nullable', 'string'],
            'emergency_contact_number' => ['nullable', 'string'],
            'required_hours' => ['nullable', 'numeric', 'min:0'],
            'f2f_hours_rate' => ['nullable', 'numeric'],
            'online_hours_rate' => ['nullable', 'numeric'],
            'discount_percent' => ['nullable', 'numeric'],
            'is_active' => ['nullable'],
        ], $this->timestampRowRules());

        $errors = [];
        $successCount = 0;
        $createdIds = [];

        // Each row is its own transaction: a bad row's constraint violation must
        // only roll back that row, not every row already imported this batch.
        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            if ($error = $this->validateRow($row, $rowRules)) {
                $errors[] = "Row {$rowNum}: {$error}";
                continue;
            }
            $email = trim($row['email']);

            // Legacy data sometimes has no gender on file at all — leave it null rather than
            // reject the whole row, but a genuinely bad (non-blank, non-male/female) value still
            // signals bad data and is rejected as before.
            $genderRaw = trim($row['gender'] ?? '');
            $gender = $genderRaw === '' ? null : strtolower($genderRaw);

            if ($gender !== null && ! in_array($gender, ['male', 'female'], true)) {
                $errors[] = "Row {$rowNum}: gender \"{$row['gender']}\" is not male/female — skipped.";
                continue;
            }

            $batch = Batches::where('batch_code', trim($row['batch_code']))->first();
            if (! $batch) {
                $errors[] = "Row {$rowNum}: batch \"{$row['batch_code']}\" not found — run the Batches import first.";
                continue;
            }
            // Legacy data sometimes has no school on file at all — leave it null rather than
            // reject the whole row, but a non-blank name that doesn't match any imported school
            // still signals bad data (or a missing Partner Schools import step) and is rejected.
            $schoolName = trim($row['school_name'] ?? '');
            $school = null;
            if ($schoolName !== '') {
                $school = PartnerSchools::whereRaw('LOWER(school_name) = ?', [mb_strtolower($schoolName)])->first();
                if (! $school) {
                    $errors[] = "Row {$rowNum}: school \"{$row['school_name']}\" not found — run the Partner Schools import first.";
                    continue;
                }
            }

            $program = ! empty($row['program_name'])
                ? AcademicProgram::whereRaw('LOWER(name) = ?', [mb_strtolower(trim($row['program_name']))])->first()
                : null;
            $level = ! empty($row['level_name'])
                ? AcademicLevel::whereRaw('LOWER(name) = ?', [mb_strtolower(trim($row['level_name']))])->first()
                : null;

            $rate = $batch->setup === 'online' ? ($row['online_hours_rate'] ?? null) : ($row['f2f_hours_rate'] ?? null);

            try {
                $trainee = DB::transaction(function () use ($row, $batch, $school, $program, $level, $email, $gender, $rate) {
                    $trainee = new Trainees([
                        // A row's own is_active flag is legacy data and often stale (see
                        // TraineeEnrollmentLinker) — but a batch that's already archived/dissolved
                        // is a hard fact: nothing enrolled in it can still be an active trainee
                        // today, regardless of what the CSV says.
                        'status' => $batch->status === Statuses::ACTIVE && $this->truthy($row['is_active'] ?? 1)
                            ? Statuses::ACTIVE
                            : Statuses::INACTIVE,
                        'batch_id' => $batch->id,
                        'school_id' => $school?->id,
                        'academic_program_id' => $program?->id,
                        'academic_level_id' => $level?->id,
                        'public_url_id' => (string) Str::ulid(),
                        'first_name' => trim($row['first_name']),
                        'last_name' => trim($row['last_name']),
                        'email' => $email,
                        'birthday' => $row['birthday'] ?: null,
                        'birth_place' => $row['birth_place'] ?? '',
                        'gender' => $gender,
                        'mobile_number' => $row['mobile_number'] ?? '',
                        'emergency_contact_name' => $row['emergency_contact_name'] ?? '',
                        'emergency_contact_number' => $row['emergency_contact_number'] ?? '',
                        // Unlike gender/school/birthday, this feeds billing math (BillingService,
                        // HourThresholdDispatcher, etc.) throughout the app — defaulting a blank
                        // value to 0 (a real number those already handle) instead of null avoids
                        // spreading null-arithmetic edge cases into code that isn't expecting them.
                        'required_hours' => $row['required_hours'] !== null && $row['required_hours'] !== ''
                            ? $row['required_hours']
                            : 0,
                        'address' => $row['address'] ?? '',
                        'override_rate_per_hour' => $rate !== null && $rate !== '' ? (float) $rate : null,
                        'override_hours_discount_percent' => isset($row['discount_percent']) && $row['discount_percent'] !== ''
                            ? (float) $row['discount_percent']
                            : null,
                    ]);
                    $this->saveWithImportTimestamps($trainee, $row);

                    return $trainee;
                });
                $createdIds[] = ['model' => Trainees::class, 'id' => $trainee->id];
                $successCount++;
            } catch (\Illuminate\Validation\ValidationException $e) {
                $errors[] = "Row {$rowNum}: " . collect($e->errors())->flatten()->first();
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('trainees', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, [], $createdIds);
    }

    private function truthy(mixed $value): bool
    {
        return in_array(is_string($value) ? strtolower(trim($value)) : $value, [1, '1', true, 'true', 'yes'], true);
    }
}
