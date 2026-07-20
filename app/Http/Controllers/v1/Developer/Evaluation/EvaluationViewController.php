<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

use App\Http\Controllers\v1\Controller;
use App\Http\Responses\InertiaPageResponse;
use App\Models\EvaluationSeminarQuestion;
use App\Models\EvaluationTrainerQuestion;
use App\Models\SeminarEvaluation;
use App\Models\TrainerEvaluation;
use App\Support\Permissions;
use App\Support\Statuses;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

/**
 * Evaluation Overview tab — analytics dashboard for the Admin Evaluation
 * module (Trainer + Seminar questionnaires). Read-only; the question banks
 * and submissions themselves are managed by EvaluationTrainerQuestionnaire /
 * EvaluationSeminarQuestionnaire and the trainee/trainer-facing submission
 * endpoints (Milestone 4).
 */
class EvaluationViewController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(['auth', 'throttle:60,1']),
            new Middleware('permission:' . Permissions::MANAGE_EVALUATION),
        ];
    }

    /** CSR shell (GET /evaluation/overview). */
    public function index(): mixed
    {
        return InertiaPageResponse::csr('developer/evaluation/index');
    }

    /**
     * Aggregated metrics for the Overview stat cards + per-batch/per-seminar
     * chart. Cheap counts only — no row-level data leaves this endpoint.
     */
    public function metrics(Request $request): mixed
    {
        $activeTrainerQuestions = EvaluationTrainerQuestion::query()->where('status', Statuses::ACTIVE)->count();
        $activeSeminarQuestions = EvaluationSeminarQuestion::query()->where('status', Statuses::ACTIVE)->count();

        $trainerEvaluations = TrainerEvaluation::query()->whereNotNull('submitted_at');
        $seminarEvaluations = SeminarEvaluation::query()->whereNotNull('submitted_at');

        $totalTrainerSubmissions = (clone $trainerEvaluations)->count();
        $totalSeminarSubmissions = (clone $seminarEvaluations)->count();
        $avgTrainerScore = (clone $trainerEvaluations)->avg('total_score');
        $avgSeminarScore = (clone $seminarEvaluations)->avg('total_score');

        $byBatch = (clone $trainerEvaluations)
            ->join('app_batches', 'app_batches.id', '=', 'app_trainer_evaluations.batch_id')
            ->selectRaw('app_batches.id as batch_id, app_batches.batch_code, count(*) as answer_count')
            ->groupBy('app_batches.id', 'app_batches.batch_code')
            ->orderByDesc('answer_count')
            ->get();

        $bySeminar = (clone $seminarEvaluations)
            ->join('app_seminars', 'app_seminars.id', '=', 'app_seminar_evaluations.seminar_id')
            ->selectRaw('app_seminars.id as seminar_id, app_seminars.topic, count(*) as answer_count')
            ->groupBy('app_seminars.id', 'app_seminars.topic')
            ->orderByDesc('answer_count')
            ->get();

        return response()->json([
            'active_trainer_questions' => $activeTrainerQuestions,
            'active_seminar_questions' => $activeSeminarQuestions,
            'total_trainer_submissions' => $totalTrainerSubmissions,
            'total_seminar_submissions' => $totalSeminarSubmissions,
            'average_trainer_score' => $avgTrainerScore ? round($avgTrainerScore, 1) : null,
            'average_seminar_score' => $avgSeminarScore ? round($avgSeminarScore, 1) : null,
            'answers_by_batch' => $byBatch,
            'answers_by_seminar' => $bySeminar,
        ]);
    }
}
