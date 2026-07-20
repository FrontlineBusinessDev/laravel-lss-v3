<?php

namespace App\Http\Controllers\v1\Trainer\Evaluations;

use App\Http\Controllers\v1\BaseController;
use App\Models\TrainerEvaluation;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;

/**
 * Trainer-facing Evaluation Overview (prefix /trainer/evaluation). Read-only:
 * evaluation records are submitted by trainees (Trainee\Evaluations) and
 * cannot be created/edited/archived/deleted from this controller — only
 * index()/paginationSearch() (inherited from BaseController) and metrics()
 * are routed. Every query is scoped to the trainer's assigned batches via
 * ScopesToAssignedBatches, mirroring TaskRatingController/RatingsController.
 */
class EvaluationsController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = TrainerEvaluation::class;
    protected string $view = 'trainer/evaluation/index';
    protected array $searchable = ['app_trainees.first_name', 'app_trainees.last_name'];
    protected array $filterable = ['batch_id', 'trainer_id'];
    protected array $exactFilters = ['batch_id', 'trainer_id'];
    protected array $sortable = ['submitted_at', 'total_score'];
    protected string $sortBy = 'submitted_at';

    protected function newQuery(): Builder
    {
        return TrainerEvaluation::query()
            ->join('app_trainees', 'app_trainees.id', '=', 'app_trainer_evaluations.trainee_id')
            ->whereNotNull('app_trainer_evaluations.submitted_at')
            ->whereIn('app_trainer_evaluations.batch_id', $this->assignedBatchIds())
            ->with(['trainee:id,first_name,last_name', 'trainer:id,first_name,last_name', 'batch:id,batch_code'])
            ->select('app_trainer_evaluations.*');
    }

    /** Aggregated metrics for the trainer's own assigned batches only. */
    public function metrics(): JsonResponse
    {
        $batchIds = $this->assignedBatchIds();
        $evaluations = TrainerEvaluation::whereIn('batch_id', $batchIds)->whereNotNull('submitted_at');

        $totalSubmissions = (clone $evaluations)->count();
        $averageScore = (clone $evaluations)->avg('total_score');

        $byBatch = (clone $evaluations)
            ->join('app_batches', 'app_batches.id', '=', 'app_trainer_evaluations.batch_id')
            ->selectRaw('app_batches.id as batch_id, app_batches.batch_code, count(*) as answer_count')
            ->groupBy('app_batches.id', 'app_batches.batch_code')
            ->orderByDesc('answer_count')
            ->get();

        return response()->json([
            'total_submissions' => $totalSubmissions,
            'average_score' => $averageScore ? round((float) $averageScore, 1) : null,
            'answers_by_batch' => $byBatch,
        ]);
    }
}
