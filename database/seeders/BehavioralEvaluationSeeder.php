<?php

namespace Database\Seeders;

use App\Models\BehavioralEvaluation;
use App\Models\BehavioralEvaluationAnswer;
use App\Models\BehavioralQuestion;
use App\Models\Trainees;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * One evaluation per (batch, trainee) pair, respecting
 * app_behavioral_evaluations_unique_current, with one answer per active
 * question — total_score is the average of that evaluation's own answers,
 * matching BehavioralEvaluationController::store()'s calculation.
 */
class BehavioralEvaluationSeeder extends Seeder
{
    public function run(): void
    {
        $questionIds = BehavioralQuestion::where('status', 'active')->pluck('id');
        if ($questionIds->isEmpty()) {
            return;
        }

        $evaluatorIds = User::role(['trainer', 'admin', 'developer'])->pluck('id');
        if ($evaluatorIds->isEmpty()) {
            $evaluatorIds = User::query()->pluck('id');
        }

        Trainees::query()
            ->whereNotNull('batch_id')
            ->inRandomOrder()
            ->limit(150)
            ->get(['id', 'batch_id'])
            ->each(function (Trainees $trainee) use ($questionIds, $evaluatorIds) {
                $scores = $questionIds->map(fn() => fake()->numberBetween(2, 5));

                $evaluation = BehavioralEvaluation::factory()->create([
                    'batch_id' => $trainee->batch_id,
                    'trainee_id' => $trainee->id,
                    'evaluator_id' => $evaluatorIds->random(),
                    'total_score' => round($scores->avg(), 1),
                ]);

                $questionIds->each(fn($questionId, $i) => BehavioralEvaluationAnswer::create([
                    'evaluation_id' => $evaluation->id,
                    'question_id' => $questionId,
                    'score' => $scores[$i],
                ]));
            });
    }
}
