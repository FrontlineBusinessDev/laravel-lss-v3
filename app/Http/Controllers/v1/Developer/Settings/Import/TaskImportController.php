<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\Task;
use App\Models\TaskRating;
use App\Models\TaskRatingHistory;
use App\Models\Trainees;
use App\Models\User;
use App\Support\Import\ImportLogging;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

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

    /** rows: [{trainee_email, trainer_email, task_title, description?, date, time_goal, time_spent?, grade?, remarks?, is_complete}] */
    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.trainee_email' => ['required', 'email'],
            'rows.*.trainer_email' => ['required', 'email'],
            'rows.*.task_title' => ['required', 'string', 'max:255'],
            'rows.*.description' => ['nullable', 'string'],
            'rows.*.date' => ['required', 'date'],
            'rows.*.time_goal' => ['required', 'numeric', 'min:0'],
            'rows.*.time_spent' => ['nullable', 'numeric', 'min:0'],
            'rows.*.grade' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'rows.*.remarks' => ['nullable', 'string'],
            'rows.*.is_complete' => ['nullable'],
        ]);

        $errors = [];
        $successCount = 0;
        $createdIds = [];

        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            $trainee = Trainees::where('email', trim($row['trainee_email']))->first();
            if (! $trainee) {
                $errors[] = "Row {$rowNum}: no trainee found with email \"{$row['trainee_email']}\" — run the Trainees import first.";
                continue;
            }
            $trainer = User::where('email', trim($row['trainer_email']))->first();
            if (! $trainer) {
                $errors[] = "Row {$rowNum}: no trainer/user found with email \"{$row['trainer_email']}\".";
                continue;
            }

            $complete = $this->truthy($row['is_complete'] ?? null);

            try {
                $rowCreatedIds = DB::transaction(function () use ($row, $trainee, $trainer, $complete) {
                    $entries = [];

                    $task = Task::create([
                        'status' => $complete ? 'completed' : 'open',
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
                    ]);
                    $entries[] = ['model' => Task::class, 'id' => $task->id];

                    if (isset($row['grade']) && $row['grade'] !== '') {
                        $rating = TaskRating::firstOrNew([
                            'batch_id' => $trainee->batch_id,
                            'task_name' => $row['task_title'],
                            'trainee_id' => $trainee->id,
                        ]);
                        $ratingIsNew = ! $rating->exists;
                        $rating->rating = (int) round((float) $row['grade']);
                        $rating->evaluator_id = $trainer->id;
                        $rating->rated_at = $row['date'];
                        $rating->comments = $row['remarks'] ?? $rating->comments;
                        $rating->save();
                        if ($ratingIsNew) {
                            $entries[] = ['model' => TaskRating::class, 'id' => $rating->id];
                        }

                        $history = $rating->history()->create([
                            'rating' => $rating->rating,
                            'comments' => $rating->comments,
                            'evaluator_id' => $trainer->id,
                            'rated_at' => $row['date'],
                        ]);
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

        return $this->finishImport('tasks', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, [], $createdIds);
    }

    private function truthy(mixed $value): bool
    {
        return in_array(is_string($value) ? strtolower(trim($value)) : $value, [1, '1', true, 'true', 'yes'], true);
    }
}
