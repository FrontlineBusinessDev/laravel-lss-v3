<?php

namespace App\Http\Controllers\v1\Trainee\Ratings;

use App\Models\TaskRating;
use App\Models\Trainees;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Trainee-facing Task Ratings API (prefix /trainee/ratings), scoped to the
 * rated tasks of the trainee record linked to the authenticated user.
 *
 * Per an explicit product decision this session, this view shows full
 * per-task detail (grade, evaluator, remarks) — a deliberate override of the
 * aggregate-only rule that still governs the My Info dashboard badges
 * (MyInfoController::index() is untouched). Behavioral ratings are never
 * selected here — only real App\Models\TaskRating columns.
 */
class RatingsController
{
    public function index(): Response
    {
        return Inertia::render('trainee/ratings/index')->asCsr();
    }

    public function paginationSearch(Request $request): JsonResponse
    {
        $trainee = $this->currentTrainee();

        $filters = (array) $request->input('filters', []);
        $sortByParam = $request->string('sort_by')->toString();
        $sortDir = $request->string('sort_dir', 'desc')->toString() === 'asc' ? 'asc' : 'desc';
        $sortable = ['rated_at', 'rating', 'created_at'];

        $query = TaskRating::query()
            ->where('trainee_id', $trainee->id)
            ->with('evaluator:id,first_name,last_name');

        if (! empty($filters['rated_at_from'])) {
            $query->whereDate('rated_at', '>=', $filters['rated_at_from']);
        }
        if (! empty($filters['rated_at_to'])) {
            $query->whereDate('rated_at', '<=', $filters['rated_at_to']);
        }
        if (! empty($filters['evaluator_id'])) {
            $query->where('evaluator_id', $filters['evaluator_id']);
        }

        if ($sortByParam !== '' && in_array($sortByParam, $sortable, true)) {
            $query->orderBy($sortByParam, $sortDir);
        } else {
            $query->orderBy('rated_at', 'desc');
        }

        $perPage = (int) $request->input('per_page', 10);
        $paginator = $query->paginate(max(1, min($perPage, 100)));

        return response()->json([
            'success' => true,
            'data' => [
                'data' => collect($paginator->items())->values(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
                'links' => [
                    'prev' => $paginator->previousPageUrl(),
                    'next' => $paginator->nextPageUrl(),
                ],
                'filters' => $filters,
                'search' => '',
                'sort_by' => $sortByParam,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    /** DB-level aggregates for the metrics bar — total rated + average rating. */
    public function metrics(): JsonResponse
    {
        $trainee = $this->currentTrainee();

        $result = TaskRating::query()
            ->where('trainee_id', $trainee->id)
            ->toBase()
            ->selectRaw('COUNT(*) as total, AVG(rating) as average')
            ->first();

        return response()->json([
            'data' => [
                'total_rated' => (int) $result->total,
                'average_rating' => $result->average !== null ? round((float) $result->average, 1) : null,
            ],
        ]);
    }

    /** Distinct trainers who have rated this trainee — feeds the Trainer filter. */
    public function trainers(): JsonResponse
    {
        $trainee = $this->currentTrainee();

        $trainers = DB::table('app_task_ratings')
            ->join('users', 'users.id', '=', 'app_task_ratings.evaluator_id')
            ->where('app_task_ratings.trainee_id', $trainee->id)
            ->distinct()
            ->orderBy('users.first_name')
            ->get(['users.id', 'users.first_name', 'users.last_name']);

        return response()->json(['data' => $trainers]);
    }

    protected function currentTrainee(): Trainees
    {
        return Trainees::where('user_id', auth()->id())->firstOrFail();
    }
}
