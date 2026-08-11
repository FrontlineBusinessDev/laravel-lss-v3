<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\BehavioralEvaluation;
use App\Models\BehavioralEvaluationAnswer;
use App\Models\BehavioralQuestion;
use App\Models\Trainees;
use App\Models\User;
use App\Support\Import\ImportLogging;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

/**
 * Phase 5c — legacy lcssv2_trainee_behavioral_evaluation(+_answer) onto
 * BehavioralEvaluation(+Answer). One CSV row per (trainee, date, question)
 * answer. Since app_behavioral_evaluations has a unique (batch_id,
 * trainee_id) constraint and no history table, rows are grouped by
 * (trainee, date) and processed oldest-to-newest so only the most recent
 * legacy evaluation per trainee survives — a stated, surfaced limitation.
 */
class BehavioralEvaluationImportController extends Controller implements HasMiddleware
{
    use ImportLogging;

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    /** rows: [{trainee_email, trainer_email, date, question_text, score, remarks?}] */
    public function import(Request $request): JsonResponse
    {
        $this->nullifyBlankRowFields($request, ['date']);
        $this->normalizeDateRowFields($request, ['date']);

        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
        ]);

        $rowRules = [
            'trainee_email' => ['required', 'email'],
            'trainer_email' => ['required', 'email'],
            'date' => ['required', 'date'],
            'question_text' => ['required', 'string'],
            'score' => ['required', 'integer', 'min:1', 'max:5'],
            'remarks' => ['nullable', 'string'],
        ];

        $rows = $validated['rows'];
        $errors = [];
        $warnings = [];
        $successCount = 0;
        $createdIds = [];

        $distinctTrainerEmails = collect($rows)
            ->pluck('trainer_email')
            ->filter()
            ->map(fn ($e) => strtolower(trim($e)))
            ->unique();
        if (count($rows) > 1 && $distinctTrainerEmails->count() === 1) {
            $warnings[] = 'All ' . count($rows) . " rows use the same trainer_email (\"{$distinctTrainerEmails->first()}\") — double-check the file's trainer_email column wasn't accidentally filled with one repeated value before assuming this is correct.";
        }

        // Group by trainee_email|date, preserving first-seen order within each group.
        // Rows failing field validation are rejected here, before grouping, so a bad
        // row can't poison its group's key or the date-based sort below.
        $groups = [];
        foreach ($rows as $i => $row) {
            $rowNum = $i + 2;
            if ($error = $this->validateRow($row, $rowRules)) {
                $errors[] = "Row {$rowNum}: {$error}";
                continue;
            }
            $key = trim($row['trainee_email']) . '|' . $row['date'];
            $groups[$key][] = ['row' => $row, 'index' => $i];
        }
        // Process oldest date first per trainee so the latest group wins on the unique-key upsert.
        uasort($groups, fn ($a, $b) => strcmp($a[0]['row']['date'], $b[0]['row']['date']));

        foreach ($groups as $group) {
            $first = $group[0]['row'];
            $rowNum = $group[0]['index'] + 2;

            $trainee = Trainees::where('email', trim($first['trainee_email']))->first();
            if (! $trainee) {
                $errors[] = "Row {$rowNum}: no trainee found with email \"{$first['trainee_email']}\" — run the Trainees import first.";
                continue;
            }
            ['user' => $trainer, 'warning' => $trainerWarning] = $this->findOrInviteTrainer($first['trainer_email']);
            if ($trainerWarning) {
                $warnings[] = "Row {$rowNum}: {$trainerWarning}";
                $createdIds[] = ['model' => User::class, 'id' => $trainer->id];
            }

            try {
                $rowCreatedIds = DB::transaction(function () use ($group, $trainee, $trainer, &$warnings) {
                    $evaluation = BehavioralEvaluation::firstOrNew([
                        'batch_id' => $trainee->batch_id,
                        'trainee_id' => $trainee->id,
                    ]);
                    $evaluationIsNew = ! $evaluation->exists;
                    $evaluation->evaluator_id = $trainer->id;
                    $evaluation->remarks = collect($group)->pluck('row.remarks')->filter()->first();
                    $evaluation->save();

                    if (! $evaluationIsNew) {
                        // A pre-existing evaluation is being matched, not created — its answers get replaced
                        // (a stated, pre-existing limitation, see class doc), but nothing here is safely
                        // reversible without a stored diff, so this row is left out of the rollback trail.
                        $warnings[] = "Trainee {$trainee->email}: matched an existing behavioral evaluation — its answers were replaced but this row is not included in rollback.";
                        $evaluation->answers()->delete();
                    }

                    $entries = $evaluationIsNew ? [['model' => BehavioralEvaluation::class, 'id' => $evaluation->id]] : [];

                    $scores = [];
                    foreach ($group as $entry) {
                        $row = $entry['row'];
                        $entryRowNum = $entry['index'] + 2;
                        $question = BehavioralQuestion::whereRaw('LOWER(question) = ?', [mb_strtolower(trim($row['question_text']))])->first();
                        if (! $question) {
                            $warnings[] = "Row {$entryRowNum}: no matching question for \"{$row['question_text']}\" — answer skipped.";
                            continue;
                        }
                        $answer = $evaluation->answers()->create([
                            'question_id' => $question->id,
                            'score' => $row['score'],
                        ]);
                        if ($evaluationIsNew) {
                            $entries[] = ['model' => BehavioralEvaluationAnswer::class, 'id' => $answer->id];
                        }
                        $scores[] = (int) $row['score'];
                    }

                    $evaluation->total_score = count($scores) > 0 ? round(array_sum($scores) / count($scores), 2) : null;
                    $evaluation->save();

                    return $entries;
                });
                array_push($createdIds, ...$rowCreatedIds);
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('behavioral_evaluations', $validated['file_name'] ?? 'import.csv', count($rows), $successCount, $errors, $warnings, $createdIds);
    }
}
