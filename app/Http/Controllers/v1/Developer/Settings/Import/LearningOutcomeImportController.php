<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\AcademicLearningOutcomes;
use App\Models\Trainees;
use App\Support\Import\ImportLogging;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

/**
 * Phase 5d — legacy lcssv2_trainee_lo onto app_trainees_learning_outcomes
 * (status: active). Replicates TraineesController::updateLearningOutcomeStatus()'s
 * industry-scoping rule: an outcome can only attach to a trainee whose
 * batch's industry matches the outcome's academic_industry_id.
 */
class LearningOutcomeImportController extends Controller implements HasMiddleware
{
    use ImportLogging;

    public static function middleware(): array
    {
        return [new Middleware(['auth', 'role:admin|developer', 'throttle:60,1'])];
    }

    /** rows: [{trainee_email, outcome_text}] */
    public function import(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file_name' => ['nullable', 'string'],
            'rows' => ['required', 'array', 'min:1'],
        ]);

        $rowRules = [
            'trainee_email' => ['required', 'email'],
            'outcome_text' => ['required', 'string'],
        ];

        $errors = [];
        $successCount = 0;
        $createdIds = [];

        foreach ($validated['rows'] as $i => $row) {
            $rowNum = $i + 2;
            if ($error = $this->validateRow($row, $rowRules)) {
                $errors[] = "Row {$rowNum}: {$error}";
                continue;
            }
            $trainee = Trainees::with('batch')->where('email', trim($row['trainee_email']))->first();
            if (! $trainee) {
                $errors[] = "Row {$rowNum}: no trainee found with email \"{$row['trainee_email']}\" — run the Trainees import first.";
                continue;
            }

            $outcome = AcademicLearningOutcomes::whereRaw('LOWER(learning_outcomes) = ?', [mb_strtolower(trim($row['outcome_text']))])->first();
            if (! $outcome) {
                $errors[] = "Row {$rowNum}: no matching learning outcome for \"{$row['outcome_text']}\".";
                continue;
            }
            if ($outcome->academic_industry_id !== $trainee->batch?->academic_industry_id) {
                $errors[] = "Row {$rowNum}: outcome \"{$row['outcome_text']}\" belongs to a different industry than {$row['trainee_email']}'s batch — skipped.";
                continue;
            }

            try {
                $alreadyAttached = DB::table('app_trainees_learning_outcomes')
                    ->where('trainee_id', $trainee->id)
                    ->where('learning_outcome_id', $outcome->id)
                    ->exists();
                DB::transaction(fn () => $trainee->learningOutcomes()->syncWithoutDetaching([$outcome->id => ['status' => 'active']]));
                if (! $alreadyAttached) {
                    $createdIds[] = ['model' => 'pivot:trainee_learning_outcome', 'trainee_id' => $trainee->id, 'outcome_id' => $outcome->id];
                }
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('learning_outcomes', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, [], $createdIds);
    }
}
