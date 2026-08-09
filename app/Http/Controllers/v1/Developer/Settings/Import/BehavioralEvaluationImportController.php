<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\BehavioralEvaluation;
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
        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
            'rows.*.trainee_email' => ['required', 'email'],
            'rows.*.trainer_email' => ['required', 'email'],
            'rows.*.date' => ['required', 'date'],
            'rows.*.question_text' => ['required', 'string'],
            'rows.*.score' => ['required', 'integer', 'min:1', 'max:5'],
            'rows.*.remarks' => ['nullable', 'string'],
        ]);

        $rows = $validated['rows'];
        $errors = [];
        $warnings = [];
        $successCount = 0;

        // Group by trainee_email|date, preserving first-seen order within each group.
        $groups = [];
        foreach ($rows as $i => $row) {
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
            $trainer = User::where('email', trim($first['trainer_email']))->first();
            if (! $trainer) {
                $errors[] = "Row {$rowNum}: no trainer/user found with email \"{$first['trainer_email']}\".";
                continue;
            }

            try {
                DB::transaction(function () use ($group, $trainee, $trainer, &$warnings) {
                    $evaluation = BehavioralEvaluation::firstOrNew([
                        'batch_id' => $trainee->batch_id,
                        'trainee_id' => $trainee->id,
                    ]);
                    $evaluation->evaluator_id = $trainer->id;
                    $evaluation->remarks = collect($group)->pluck('row.remarks')->filter()->first();
                    $evaluation->save();
                    $evaluation->answers()->delete();

                    $scores = [];
                    foreach ($group as $entry) {
                        $row = $entry['row'];
                        $entryRowNum = $entry['index'] + 2;
                        $question = BehavioralQuestion::whereRaw('LOWER(question) = ?', [mb_strtolower(trim($row['question_text']))])->first();
                        if (! $question) {
                            $warnings[] = "Row {$entryRowNum}: no matching question for \"{$row['question_text']}\" — answer skipped.";
                            continue;
                        }
                        $evaluation->answers()->create([
                            'question_id' => $question->id,
                            'score' => $row['score'],
                        ]);
                        $scores[] = (int) $row['score'];
                    }

                    $evaluation->total_score = count($scores) > 0 ? round(array_sum($scores) / count($scores), 2) : null;
                    $evaluation->save();
                });
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('behavioral_evaluations', $validated['file_name'] ?? 'import.csv', count($rows), $successCount, $errors, $warnings);
    }
}
