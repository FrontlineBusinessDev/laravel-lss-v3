<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\Task;
use App\Models\TaskRating;
use App\Models\TaskRatingHistory;
use App\Models\User;
use App\Support\Import\ImportLogging;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Phase 5b — legacy lcssv2_task+lcssv2_task_list onto BOTH app_tasks (the
 * completion/time-tracking record) and app_task_ratings (the numeric grade,
 * free-text task_name, per the confirmed schema split). Matched by trainee
 * email + trainer email.
 */
class TaskImportController extends Controller implements HasMiddleware
{
    use ImportLogging;

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    /** rows: [{trainee_email, trainer_email?, task_title, description?, date, time_goal, time_spent?, grade?, remarks?, is_complete}] */
    public function import(Request $request): JsonResponse
    {
        $this->nullifyBlankRowFields($request, ['date', 'time_spent']);
        $this->normalizeDateRowFields($request, ['date']);
        $this->normalizeDurationRowFields($request, ['time_goal', 'time_spent']);
        $this->defaultInvalidNumericRowFields($request, ['time_spent']);

        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
        ]);

        $rowRules = array_merge([
            'trainee_email' => ['required', 'email'],
            'trainer_email' => ['nullable', 'email'],
            'task_title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'date' => ['required', 'date'],
            'time_goal' => ['required', 'numeric', 'min:0'],
            'time_spent' => ['nullable', 'numeric', 'min:0'],
            'grade' => ['nullable', 'numeric'],
            'remarks' => ['nullable', 'string'],
            'is_complete' => ['nullable'],
        ], $this->timestampRowRules());

        $errors = [];
        $warnings = [];
        $successCount = 0;
        $createdIds = [];

        $distinctTrainerEmails = collect($validated['rows'])
            ->pluck('trainer_email')
            ->filter()
            ->map(fn ($e) => strtolower(trim($e)))
            ->unique();
        if (count($validated['rows']) > 1 && $distinctTrainerEmails->count() === 1) {
            $warnings[] = 'All '.count($validated['rows'])." rows use the same trainer_email (\"{$distinctTrainerEmails->first()}\") — double-check the file's trainer_email column wasn't accidentally filled with one repeated value before assuming this is correct.";
        }

        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            if ($error = $this->validateRow($row, $rowRules)) {
                $errors[] = "Row {$rowNum}: {$error}";

                continue;
            }

            // A historical task can't happen after the row recording it was created — a legacy
            // export bug (confirmed in lcssv2_tasks_and_grade.csv: ~29% of rows exported with
            // `date` reset to the export run's own date) sometimes overwrites the real date with
            // a bogus one. created_at is a real, plausible timestamp already in the same row, so
            // fall back to it instead of trusting the corrupted date.
            if (! empty($row['created_at'])) {
                $createdDate = substr($row['created_at'], 0, 10);
                if ($row['date'] > $createdDate) {
                    $warnings[] = "Row {$rowNum}: date \"{$row['date']}\" is after this row's created_at ({$createdDate}) — used created_at's date instead.";
                    $row['date'] = $createdDate;
                }
            }

            ['trainee' => $trainee, 'warning' => $traineeWarning] = $this->resolveImportTrainee(trim($row['trainee_email']), $row['batch_code'] ?? null);
            if (! $trainee) {
                $errors[] = "Row {$rowNum}: no trainee found with email \"{$row['trainee_email']}\" — run the Trainees import first.";

                continue;
            }
            if ($traineeWarning) {
                $warnings[] = "Row {$rowNum}: {$traineeWarning}";
            }
            if (! empty($row['trainer_email'])) {
                ['user' => $trainer, 'warning' => $trainerWarning] = $this->findOrInviteTrainer($row['trainer_email']);
                if ($trainerWarning) {
                    $warnings[] = "Row {$rowNum}: {$trainerWarning}";
                    $createdIds[] = ['model' => User::class, 'id' => $trainer->id];
                }
            } else {
                // No trainer named at all — assign the single shared "Unassigned Trainer"
                // placeholder account rather than rejecting the row over missing legacy data.
                $trainer = $this->findOrCreatePlaceholderTrainer();
            }

            $complete = $this->truthy($row['is_complete'] ?? null);
            $hasGrade = isset($row['grade']) && $row['grade'] !== '';
            // Legacy grades occasionally fall outside 0-100 (typos, bad exports) —
            // clamp instead of rejecting the row over one bad value.
            $newRating = $hasGrade ? (int) round(max(0, min(100, (float) $row['grade']))) : null;
            $newComments = $row['remarks'] ?? null;

            // whereDate(), not where() — a plain string comparison against a `date`-cast column
            // silently never matches on SQLite (stores "YYYY-MM-DD 00:00:00"), which was letting
            // every "duplicate" row for the same (trainee, task, date) through as a new Task.
            $existingTask = Task::where('trainee_id', $trainee->id)
                ->where('batch_id', $trainee->batch_id)
                ->where('task', $row['task_title'])
                ->whereDate('date', $row['date'])
                ->first();

            // v1/v2 legacy exports repeat the same (trainee, task, date) across several rows as a
            // grade gets progressively filled in (blank -> blank -> 85) instead of one grouped row —
            // only truly redundant repeats (same grade already recorded) are skipped as duplicates;
            // a row that actually changes the grade still updates the shared TaskRating/history below.
            $existingRating = $hasGrade
                ? TaskRating::where('batch_id', $trainee->batch_id)
                    ->where('task_name', $row['task_title'])
                    ->where('trainee_id', $trainee->id)
                    ->first()
                : null;
            $gradeChanged = $hasGrade && (
                ! $existingRating
                || (int) $existingRating->rating !== $newRating
                || ($existingRating->comments ?? null) !== ($newComments ?? $existingRating->comments ?? null)
            );

            if ($existingTask && ! $gradeChanged) {
                $errors[] = "Row {$rowNum}: duplicate task \"{$row['task_title']}\" for \"{$row['trainee_email']}\" on {$row['date']} — skipped.";

                continue;
            }

            try {
                $rowCreatedIds = DB::transaction(function () use ($row, $trainee, $trainer, $complete, $existingTask, $hasGrade, $newRating, $newComments) {
                    $entries = [];

                    if (! $existingTask) {
                        $task = new Task([
                            'task_group_id' => (string) Str::uuid(),
                            // Legacy rows are historical facts, not live work — never leave an
                            // imported task "open" (editable/actionable in today's app); an
                            // incomplete one is locked instead so it can't be reopened by mistake.
                            'status' => $complete ? 'completed' : 'locked',
                            'batch_id' => $trainee->batch_id,
                            'trainee_id' => $trainee->id,
                            'trainer_id' => $trainer->id,
                            'task' => $row['task_title'],
                            'description' => $row['description'] ?? null,
                            'time_goal' => $row['time_goal'],
                            'time_spent' => $row['time_spent'] ?? 0,
                            'date' => $row['date'],
                            'remarks' => $row['remarks'] ?? null,
                            'completed_at' => $complete ? $row['date'] : null,
                            'locked_at' => $complete ? null : now(),
                        ]);
                        $this->saveWithImportTimestamps($task, $row);
                        $entries[] = ['model' => Task::class, 'id' => $task->id];
                    }

                    if ($hasGrade) {
                        $rating = TaskRating::firstOrNew([
                            'batch_id' => $trainee->batch_id,
                            'task_name' => $row['task_title'],
                            'trainee_id' => $trainee->id,
                        ]);
                        $ratingIsNew = ! $rating->exists;
                        $rating->rating = $newRating;
                        $rating->evaluator_id = $trainer->id;
                        $rating->rated_at = $row['date'];
                        $rating->comments = $newComments ?? $rating->comments;
                        if ($ratingIsNew) {
                            $this->saveWithImportTimestamps($rating, $row);
                            $entries[] = ['model' => TaskRating::class, 'id' => $rating->id];
                        } else {
                            $rating->save();
                        }

                        $history = $rating->history()->make([
                            'rating' => $rating->rating,
                            'comments' => $rating->comments,
                            'evaluator_id' => $trainer->id,
                            'rated_at' => $row['date'],
                        ]);
                        $this->saveWithImportTimestamps($history, $row);
                        // Append-only audit trail — always a genuinely new row regardless of whether the rating itself was new.
                        $entries[] = ['model' => TaskRatingHistory::class, 'id' => $history->id];
                    }

                    return $entries;
                });
                array_push($createdIds, ...$rowCreatedIds);
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('tasks', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, $warnings, $createdIds);
    }

    private function truthy(mixed $value): bool
    {
        return in_array(is_string($value) ? strtolower(trim($value)) : $value, [1, '1', true, 'true', 'yes'], true);
    }
}
