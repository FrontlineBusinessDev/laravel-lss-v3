<?php

namespace App\Support\Import;

use App\Mail\UserInviteMail;
use App\Models\SettingsImportLog;
use App\Models\User;
use App\Support\PasswordSetupUrl;
use App\Support\Statuses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

/** Shared response/audit-log helper for every Settings > Import phase controller. */
trait ImportLogging
{
    /**
     * Matches an existing trainer by email, or creates+invites one — mirroring the real "add staff" flow in
     * UserController (active status, random unusable password, trainer role, password-setup invite email)
     * so an import-created account is never left inactive or emailless. Returns the user plus a warning to
     * surface when one was created.
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
            'status' => Statuses::ACTIVE,
        ]);
        $user->assignRole('trainer');

        $resetUrl = PasswordSetupUrl::generate($user);
        Mail::to($user->email)->queue(new UserInviteMail($user, $resetUrl));

        return [
            'user' => $user,
            'warning' => "No trainer found for \"{$email}\" — created a new active trainer account and emailed a password-setup invite (name guessed from the address; correct it in Settings > Users if wrong).",
        ];
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
