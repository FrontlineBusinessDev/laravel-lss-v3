<?php

namespace App\Http\Controllers\v1\Developer\Settings\Import;

use App\Http\Controllers\v1\Controller;
use App\Models\AcademicLearningOutcomes;
use App\Support\Import\ImportLogging;
use App\Support\Statuses;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Illuminate\Support\Facades\DB;

/**
 * Phase 5d — legacy lcssv2_trainee_lo onto app_trainees_learning_outcomes
 * (status: active). Unlike TraineesController::updateLearningOutcomeStatus()
 * (live assignment), this import does NOT enforce that an outcome's industry
 * matches the trainee's batch industry: `learning_outcomes` text is globally
 * unique in the schema, but the legacy data reuses the same wording across
 * trainees from different industries, so one canonical row is attached to
 * all of them — this is recording a historical fact ("trainee completed
 * this outcome"), not a new live assignment subject to that rule. When the
 * text has no matching row yet (this pipeline has no reference-data import
 * step for outcomes), a new one is created — scoped to the trainee's own
 * batch industry — and left `inactive` for an admin to review.
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

        $rowRules = array_merge([
            'trainee_email' => ['required', 'email'],
            'outcome_text' => ['required', 'string'],
        ], $this->timestampRowRules());

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
            ['trainee' => $trainee, 'warning' => $traineeWarning] = $this->resolveImportTrainee(trim($row['trainee_email']), $row['batch_code'] ?? null);
            if (! $trainee) {
                $errors[] = "Row {$rowNum}: no trainee found with email \"{$row['trainee_email']}\" — run the Trainees import first.";
                continue;
            }
            if ($traineeWarning) {
                $warnings[] = "Row {$rowNum}: {$traineeWarning}";
            }

            $outcomeText = trim($row['outcome_text']);
            $outcome = AcademicLearningOutcomes::whereRaw('LOWER(learning_outcomes) = ?', [mb_strtolower($outcomeText)])->first();
            if (! $outcome) {
                if (! $trainee->batch) {
                    $errors[] = "Row {$rowNum}: trainee \"{$row['trainee_email']}\" has no batch — cannot determine an industry to create outcome \"{$row['outcome_text']}\".";
                    continue;
                }
                $outcome = new AcademicLearningOutcomes([
                    'status' => Statuses::INACTIVE,
                    'learning_outcomes' => $outcomeText,
                    'academic_industry_id' => $trainee->batch->academic_industry_id,
                ]);
                $this->saveWithImportTimestamps($outcome, $row);
                $createdIds[] = ['model' => AcademicLearningOutcomes::class, 'id' => $outcome->id];
            }

            try {
                $alreadyAttached = DB::table('app_trainees_learning_outcomes')
                    ->where('trainee_id', $trainee->id)
                    ->where('learning_outcome_id', $outcome->id)
                    ->exists();
                $timestamps = $this->importTimestamps($row);

                // Bypasses the learningOutcomes() relation's automatic withTimestamps() pivot
                // stamping (which would always overwrite updated_at with "now"), so the row's
                // own legacy created_at/updated_at survive instead.
                DB::transaction(function () use ($trainee, $outcome, $timestamps, $alreadyAttached) {
                    if ($alreadyAttached) {
                        DB::table('app_trainees_learning_outcomes')
                            ->where('trainee_id', $trainee->id)
                            ->where('learning_outcome_id', $outcome->id)
                            ->update([
                                'status' => 'active',
                                'updated_at' => $timestamps['updated_at'],
                            ]);
                    } else {
                        DB::table('app_trainees_learning_outcomes')->insert([
                            'trainee_id' => $trainee->id,
                            'learning_outcome_id' => $outcome->id,
                            'status' => 'active',
                            'created_at' => $timestamps['created_at'],
                            'updated_at' => $timestamps['updated_at'],
                        ]);
                    }
                });
                if (! $alreadyAttached) {
                    $createdIds[] = ['model' => 'pivot:trainee_learning_outcome', 'trainee_id' => $trainee->id, 'outcome_id' => $outcome->id];
                }
                $successCount++;
            } catch (\Throwable $e) {
                $errors[] = "Row {$rowNum}: {$e->getMessage()}";
            }
        }

        return $this->finishImport('learning_outcomes', $validated['file_name'] ?? 'import.csv', count($validated['rows']), $successCount, $errors, $warnings, $createdIds);
    }
}
