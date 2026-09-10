<?php

namespace App\Support\Import;

use App\Models\SettingsImportLog;
use App\Models\Trainees;
use App\Models\User;
use App\Support\Statuses;
use App\Support\TraineeEnrollmentLinker;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/** Shared response/audit-log helper for every Settings > Import phase controller. */
trait ImportLogging
{
    /**
     * Matches an existing trainer by email, or creates one — mirroring the real "add staff" flow in
     * UserController (random unusable password, trainer role), except the account is left inactive and
     * no invite email is sent, since it's provisional (name guessed from the email address) and shouldn't
     * be able to log in — or be notified — until an admin reviews and activates it. Returns the user plus
     * a warning to surface when one was created.
     *
     * @return array{user: User, warning: ?string}
     */
    protected function findOrInviteTrainer(string $email): array
    {
        $email = trim($email);
        $user = User::where('email', $email)->first();
        if ($user) {
            return ['user' => $user, 'warning' => null];
        }

        [$firstName, $lastName] = $this->guessNameFromEmail($email);

        $user = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => Hash::make(Str::password(16)),
            'status' => Statuses::INACTIVE,
        ]);
        $user->assignRole('trainer');

        return [
            'user' => $user,
            'warning' => "No trainer found for \"{$email}\" — created a new inactive trainer account (name guessed from the address; correct it and activate the account in Settings > Users to invite them).",
        ];
    }

    /**
     * A single shared, inactive placeholder trainer account for import rows that don't name a
     * trainer at all (as opposed to `findOrInviteTrainer()`, which handles a *named* trainer
     * that just doesn't have an account yet). Find-or-create by a fixed sentinel email, so every
     * such row across every import — and every re-import — points at the same one account
     * instead of minting a new placeholder each time.
     */
    protected function findOrCreatePlaceholderTrainer(): User
    {
        $email = 'unassigned-trainer@import.local';
        $user = User::where('email', $email)->first();
        if ($user) {
            return $user;
        }

        $user = User::create([
            'first_name' => 'Unassigned',
            'last_name' => 'Trainer',
            'email' => $email,
            'password' => Hash::make(Str::password(16)),
            'status' => Statuses::INACTIVE,
        ]);
        $user->assignRole('trainer');

        return $user;
    }

    /** @return array{0: string, 1: string} */
    private function guessNameFromEmail(string $email): array
    {
        $local = strstr($email, '@', true) ?: $email;
        $parts = array_values(array_filter(preg_split('/[._-]+/', $local) ?: []));
        $parts = array_map(fn ($p) => ucfirst(strtolower($p)), $parts);

        if (count($parts) >= 2) {
            return [$parts[0], implode(' ', array_slice($parts, 1))];
        }

        return [$parts[0] ?? 'Trainer', 'Account'];
    }

    /** Row-validation rules for the optional legacy `created_at`/`updated_at` columns every import phase accepts. */
    protected function timestampRowRules(): array
    {
        return [
            'created_at' => ['nullable', 'date'],
            'updated_at' => ['nullable', 'date'],
        ];
    }

    /**
     * Resolves the created_at/updated_at pair to stamp on a freshly-created import row: the
     * row's own legacy values when present (from `created_at`/`updated_at` columns exported
     * from the legacy DB), falling back to "now" so CSVs without those columns still import
     * exactly as before.
     *
     * @return array{created_at: Carbon, updated_at: Carbon}
     */
    protected function importTimestamps(array $row): array
    {
        $createdAt = ! empty($row['created_at']) ? Carbon::parse($row['created_at']) : now();
        $updatedAt = ! empty($row['updated_at']) ? Carbon::parse($row['updated_at']) : $createdAt;

        return ['created_at' => $createdAt, 'updated_at' => $updatedAt];
    }

    /**
     * Stamps an unsaved model with importTimestamps($row) and saves it with automatic
     * timestamp management disabled, so save() doesn't overwrite the values just set. Use this
     * instead of `Model::create()`/`$relation->create()` for any import row that should carry
     * the legacy created_at/updated_at instead of getting stamped at import time. Models with
     * no `updated_at` column (`::UPDATED_AT === null`, e.g. TaskRatingHistory) are left with
     * only `created_at` set.
     */
    protected function saveWithImportTimestamps(Model $model, array $row): void
    {
        $timestamps = $this->importTimestamps($row);
        $model->setAttribute($model::CREATED_AT ?? 'created_at', $timestamps['created_at']);
        if ($model::UPDATED_AT !== null) {
            $model->setAttribute($model::UPDATED_AT, $timestamps['updated_at']);
        }
        $model->timestamps = false;
        $model->save();
    }

    /**
     * Resolves the trainee row a secondary import CSV (task/payment/behavioral
     * evaluation/learning outcome) should attach to, by `trainee_email`. Now
     * that the same email can have multiple app_trainees rows (re-enrollment
     * across batches), an exact `batch_code` match disambiguates when given;
     * otherwise falls back to the current enrollment (TraineeEnrollmentLinker::resolveHead())
     * with a warning so the importer can add batch_code if it picked wrong.
     *
     * @return array{trainee: ?Trainees, warning: ?string}
     */
    protected function resolveImportTrainee(string $email, ?string $batchCode = null): array
    {
        $matches = Trainees::whereRaw('LOWER(email) = ?', [mb_strtolower(trim($email))])
            ->with('batch:id,batch_code,academic_industry_id')
            ->orderBy('created_at')
            ->orderBy('id')
            ->get();

        if ($matches->isEmpty()) {
            return ['trainee' => null, 'warning' => null];
        }
        if ($matches->count() === 1) {
            return ['trainee' => $matches->first(), 'warning' => null];
        }

        if ($batchCode !== null && $batchCode !== '') {
            $exact = $matches->first(fn (Trainees $t) => $t->batch?->batch_code === trim($batchCode));
            if ($exact) {
                return ['trainee' => $exact, 'warning' => null];
            }
        }

        $head = TraineeEnrollmentLinker::resolveHead($matches);

        return [
            'trainee' => $head,
            'warning' => "\"{$email}\" matches {$matches->count()} enrollment records — imported against the current one (trainee #{$head->id}, batch #{$head->batch_id}). Add a batch_code column to disambiguate if this is wrong.",
        ];
    }

    /** Validates a single decoded CSV row against its field rules, returning the first error message or null. Row-by-row validation (instead of `rows.*.field` wildcard rules) means one bad row is just another skippable per-row error — not a `ValidationException` that aborts the whole request/chunk and, with chunked uploads, every chunk after it. */
    protected function validateRow(array $row, array $rules): ?string
    {
        $validator = Validator::make($row, $rules);

        return $validator->fails() ? $validator->errors()->first() : null;
    }

    /** Converts empty-string and literal "NULL" text values to null for the given `rows.*` field names, so `nullable` date/numeric rules correctly skip validation on blank CSV cells (Laravel's `nullable` only short-circuits on actual null, not "" — and some DB export tools write SQL NULLs as the literal text "NULL"). */
    protected function nullifyBlankRowFields(Request $request, array $fields): void
    {
        $rows = $request->input('rows', []);
        if (! is_array($rows)) {
            return;
        }

        foreach ($rows as $i => $row) {
            foreach ($fields as $field) {
                $value = $row[$field] ?? null;
                if ($value === '' || (is_string($value) && strtolower(trim($value)) === 'null')) {
                    $rows[$i][$field] = null;
                }
            }
        }

        $request->merge(['rows' => $rows]);
    }

    /**
     * Coerces any `rows.*` field value that isn't null/blank and isn't numeric (after nullify/duration
     * normalization already ran) to $default, instead of letting it fail the `numeric` validation rule
     * and reject the whole row over one bad cell.
     */
    protected function defaultInvalidNumericRowFields(Request $request, array $fields, string $default = '0'): void
    {
        $rows = $request->input('rows', []);
        if (! is_array($rows)) {
            return;
        }

        foreach ($rows as $i => $row) {
            foreach ($fields as $field) {
                $value = $row[$field] ?? null;
                if ($value !== null && $value !== '' && ! is_numeric($value)) {
                    $rows[$i][$field] = $default;
                }
            }
        }

        $request->merge(['rows' => $rows]);
    }

    /**
     * Rewrites the given `rows.*` date field names to ISO `Y-m-d` before validation, accepting either
     * `Y-m-d` (the documented template format) or `d/m/Y` (day-first, seen from some DB export tools).
     * Slash-separated dates are deliberately never guessed as `m/d/Y` — that would silently swap day/month
     * for any value with day <= 12 (e.g. "08/07/2024" meaning 8 July, misread as August 7th). Values that
     * don't match either format are left untouched so the `date` validation rule still rejects them clearly.
     */
    protected function normalizeDateRowFields(Request $request, array $fields): void
    {
        $rows = $request->input('rows', []);
        if (! is_array($rows)) {
            return;
        }

        foreach ($rows as $i => $row) {
            foreach ($fields as $field) {
                $value = $row[$field] ?? null;
                if (! is_string($value) || $value === '') {
                    continue;
                }

                $normalized = $this->parseFlexibleDate($value);
                if ($normalized !== null) {
                    $rows[$i][$field] = $normalized;
                }
            }
        }

        $request->merge(['rows' => $rows]);
    }

    private function parseFlexibleDate(string $value): ?string
    {
        $value = trim($value);

        if (preg_match('/^(\d{4})-(\d{1,2})-(\d{1,2})$/', $value, $m)) {
            [, $year, $month, $day] = $m;
        } elseif (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $value, $m)) {
            [, $day, $month, $year] = $m;
        } else {
            return null;
        }

        $year = (int) $year;
        $month = (int) $month;
        $day = (int) $day;

        if (! checkdate($month, $day, $year)) {
            return null;
        }

        return sprintf('%04d-%02d-%02d', $year, $month, $day);
    }

    /**
     * Rewrites the given `rows.*` field names from `H:MM`/`HH:MM` clock-duration strings (e.g. "08:00",
     * "00:30") into decimal hours ("8.00", "0.50") before validation, matching how `time_goal`/`time_spent`
     * are actually stored (`decimal(5,2)`, see `App\Models\Task`). Legacy CSV exports carry these as
     * clock strings, not decimals — left as-is they fail the `numeric` rule on every single row. Values
     * that don't match the `H:MM` shape are left untouched so validation still rejects genuinely bad data.
     */
    protected function normalizeDurationRowFields(Request $request, array $fields): void
    {
        $rows = $request->input('rows', []);
        if (! is_array($rows)) {
            return;
        }

        foreach ($rows as $i => $row) {
            foreach ($fields as $field) {
                $value = $row[$field] ?? null;
                if (! is_string($value) || $value === '') {
                    continue;
                }

                $normalized = $this->parseClockDuration($value);
                if ($normalized !== null) {
                    $rows[$i][$field] = $normalized;
                }
            }
        }

        $request->merge(['rows' => $rows]);
    }

    private function parseClockDuration(string $value): ?string
    {
        $value = trim($value);

        if (! preg_match('/^(\d{1,3}):(\d{2})$/', $value, $m)) {
            return null;
        }

        $hours = (int) $m[1];
        $minutes = (int) $m[2];
        if ($minutes > 59) {
            return null;
        }

        return number_format($hours + $minutes / 60, 2, '.', '');
    }

    /**
     * @param list<string> $errors per-row error messages, index-aligned isn't required — just surfaced to the admin
     * @param list<string> $warnings non-fatal notices (e.g. "unmatched question skipped")
     * @param list<array<string, mixed>> $createdIds ordered `{model, id}` (or `{model: 'pivot:trainee_learning_outcome', trainee_id, outcome_id}`)
     *        entries for records this import genuinely CREATED — used by ImportRollbackController to undo the import.
     *        Rows that only matched/updated a pre-existing record must NOT be included here.
     */
    protected function finishImport(
        string $type,
        string $fileName,
        int $totalRows,
        int $successCount,
        array $errors,
        array $warnings = [],
        array $createdIds = [],
    ): JsonResponse {
        $errorCount = count($errors);
        $status = match (true) {
            $successCount === 0 => 'failed',
            $errorCount === 0 => 'success',
            default => 'partial',
        };

        $log = SettingsImportLog::create([
            'type' => $type,
            'file_name' => $fileName,
            'imported_by_id' => auth()->id(),
            'total_rows' => $totalRows,
            'success_count' => $successCount,
            'error_count' => $errorCount,
            'status' => $status,
            'warnings' => $warnings,
            'errors' => $errors,
            'created_ids' => $createdIds,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'log' => $log,
                'created_count' => $successCount,
                'errors' => $errors,
                'warnings' => $warnings,
            ],
        ]);
    }
}
