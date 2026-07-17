<?php

namespace App\Http\Controllers\v1\Developer\Ratings;

use App\Http\Controllers\v1\Developer\Controller;
use App\Http\Responses\InertiaPageResponse;
use App\Models\Task;
use App\Models\TaskRating;
use App\Models\Trainees;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

/**
 * Task Rating API (prefix /ratings/task-rating). Batch -> task/project name ->
 * trainee -> rating, with an append-only history trail on every save.
 */
class TaskRatingController extends Controller
{
    public function index(): Response
    {
        return InertiaPageResponse::csr('developer/ratings/index');
    }

    /** Distinct task/project names that exist for a batch, across all task statuses. */
    public function taskOptions(Request $request): JsonResponse
    {
        $validated = $request->validate(['batch_id' => ['required', 'integer', 'exists:app_batches,id']]);

        $tasks = Task::where('batch_id', $validated['batch_id'])
            ->distinct()
            ->orderBy('task')
            ->pluck('task');

        return response()->json(['data' => $tasks]);
    }

    /** Active trainees in a batch, for the ratings table. */
    public function trainees(Request $request): JsonResponse
    {
        $validated = $request->validate(['batch_id' => ['required', 'integer', 'exists:app_batches,id']]);

        $trainees = Trainees::where('batch_id', $validated['batch_id'])
            ->where('status', 'active')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        return response()->json(['data' => $trainees]);
    }

    /** Existing ratings for a batch+task, one row per trainee already rated. */
    public function forTask(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'batch_id' => ['required', 'integer', 'exists:app_batches,id'],
            'task_name' => ['required', 'string'],
        ]);

        $ratings = TaskRating::where('batch_id', $validated['batch_id'])
            ->where('task_name', $validated['task_name'])
            ->with(['trainee:id,first_name,last_name', 'evaluator:id,first_name,last_name'])
            ->get();

        return response()->json(['data' => $ratings]);
    }

    /** Upsert a trainee's rating for a batch+task and append it to the audit trail. */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'batch_id' => ['required', 'integer', 'exists:app_batches,id'],
            'task_name' => ['required', 'string'],
            'trainee_id' => ['required', 'integer', 'exists:app_trainees,id'],
            'rating' => ['required', 'integer', 'between:1,100'],
            'comments' => ['nullable', 'string'],
        ]);

        $rating = DB::transaction(function () use ($validated) {
            $rating = TaskRating::firstOrNew([
                'batch_id' => $validated['batch_id'],
                'task_name' => $validated['task_name'],
                'trainee_id' => $validated['trainee_id'],
            ]);
            $rating->fill([
                'rating' => $validated['rating'],
                'comments' => $validated['comments'] ?? null,
                'evaluator_id' => auth()->id(),
                'rated_at' => now()->toDateString(),
            ])->save();

            $rating->history()->create([
                'rating' => $validated['rating'],
                'comments' => $validated['comments'] ?? null,
                'evaluator_id' => auth()->id(),
                'rated_at' => now()->toDateString(),
            ]);

            return $rating;
        });

        return response()->json(['data' => $rating->load(['trainee:id,first_name,last_name', 'evaluator:id,first_name,last_name'])]);
    }

    /** Audit trail for one rating, newest first. */
    public function history(int|string $id): JsonResponse
    {
        $rating = TaskRating::findOrFail($id);
        $history = $rating->history()->with('evaluator:id,first_name,last_name')->get();

        return response()->json(['data' => $history]);
    }
}
