<?php

namespace App\Http\Controllers\v1\Trainee\Tasks;

use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\Trainees;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Trainee-facing Tasks API (prefix /trainee/tasks), scoped to the tasks
 * assigned to the trainee record linked to the authenticated user
 * (App\Models\Trainees::user_id). Ownership is enforced twice: the query
 * scoping here, and TaskPolicy::isOwn() via $this->authorize().
 */
class TasksController
{
    use AuthorizesRequests;

    public function index(): Response
    {
        return Inertia::render('trainee/tasks/index')->asCsr();
    }

    public function dailyTask(): Response
    {
        return Inertia::render('trainee/tasks/daily-task')->asCsr();
    }

    /**
     * Serves both dashboard tabs from one endpoint via a `view` param:
     * 'open' (default, "Tasks" tab) or 'completed' ("Daily Task Sheet" tab).
     */
    public function paginationSearch(Request $request): JsonResponse
    {
        $trainee = $this->currentTrainee($request);

        $search = $request->string('search')->toString();
        $filters = (array) $request->input('filters', []);
        $view = $filters['view'] ?? 'open';
        $sortByParam = $request->string('sort_by')->toString();
        $sortDir = $request->string('sort_dir', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $sortable = ['date', 'completed_at', 'created_at'];

        $query = Task::query()
            ->where('trainee_id', $trainee->id)
            ->where('status', $view === 'completed' ? 'completed' : 'open')
            ->with(['batch:id,batch_code', 'trainer:id,first_name,last_name']);

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('task', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (! empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }
        if (! empty($filters['batch_id'])) {
            $query->where('batch_id', $filters['batch_id']);
        }
        if (! empty($filters['due_bucket'])) {
            $today = now()->toDateString();
            $weekEnd = now()->addDays(7)->toDateString();
            match ($filters['due_bucket']) {
                'overdue' => $query->whereDate('date', '<', $today),
                'due_today' => $query->whereDate('date', '=', $today),
                'due_this_week' => $query->whereDate('date', '>=', $today)->whereDate('date', '<=', $weekEnd),
                default => null,
            };
        }
        if (! empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }
        if (! empty($filters['completed_from'])) {
            $query->whereDate('completed_at', '>=', $filters['completed_from']);
        }
        if (! empty($filters['completed_to'])) {
            $query->whereDate('completed_at', '<=', $filters['completed_to']);
        }

        if ($sortByParam !== '' && in_array($sortByParam, $sortable, true)) {
            $query->orderBy($sortByParam, $sortDir);
        } else {
            $query->orderBy('date', 'asc');
        }

        $perPage = (int) $request->input('per_page', 10);
        $paginator = $query->paginate(max(1, min($perPage, 100)));

        return $this->sendResponse([
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
            'search' => $search,
            'sort_by' => $sortByParam,
            'sort_dir' => $sortDir,
        ]);
    }

    /** Start the timer on an open, not-already-running task. */
    public function runAction(int|string $id, Request $request): JsonResponse
    {
        $model = $this->ownedTask($request, $id);
        $this->authorize('update', $model);

        abort_if($model->status !== 'open', 422, 'Only open tasks can be started.');
        abort_if($model->is_running, 422, 'This task is already running.');

        $model->update(['is_running' => true, 'started_at' => now()]);

        return $this->sendResponse($model, 'Task started.');
    }

    /** Stop the timer, folding the elapsed time into time_spent. */
    public function stopAction(int|string $id, Request $request): JsonResponse
    {
        $model = $this->ownedTask($request, $id);
        $this->authorize('update', $model);

        abort_if(! $model->is_running || ! $model->started_at, 422, 'This task is not running.');

        $model->update($this->foldElapsedTime($model) + ['is_running' => false, 'started_at' => null]);

        return $this->sendResponse($model, 'Task stopped.');
    }

    /** Mark complete — folds any running timer into time_spent first so no time is lost. */
    public function completeAction(int|string $id, Request $request): JsonResponse
    {
        $model = $this->ownedTask($request, $id);
        $this->authorize('update', $model);

        abort_if($model->status === 'locked', 422, 'Locked tasks can no longer be completed.');

        $attributes = ['status' => 'completed', 'completed_at' => now()];
        if ($model->is_running && $model->started_at) {
            $attributes = $this->foldElapsedTime($model) + $attributes + ['is_running' => false, 'started_at' => null];
        }
        $model->update($attributes);

        return $this->sendResponse($model, 'Task marked as complete.');
    }

    /** Trainee's own remarks — blocked while Locked or on approved leave for that date. */
    public function updateRemarks(Request $request, int|string $id): JsonResponse
    {
        $model = $this->ownedTask($request, $id);
        $this->authorize('update', $model);
        $validated = $request->validate(['remarks' => ['nullable', 'string']]);

        abort_if($model->status === 'locked', 422, 'This task is locked and can no longer be edited.');
        $onLeave = LeaveRequest::approvedCovering($model->date->toDateString())
            ->where('trainee_id', $model->trainee_id)
            ->exists();
        abort_if($onLeave, 422, 'This field is locked while you are on approved leave for this date.');

        $model->update(['remarks' => $validated['remarks']]);

        return $this->sendResponse($model, 'Remarks saved.');
    }

    /**
     * time_spent += elapsed hours since started_at, rounded to 2dp (decimal-safe, avoids minute truncation).
     * @return array{time_spent: float}
     */
    protected function foldElapsedTime(Task $model): array
    {
        $elapsedHours = $model->started_at->diffInSeconds(now()) / 3600;

        return ['time_spent' => round((float) $model->time_spent + $elapsedHours, 2)];
    }

    protected function currentTrainee(Request $request): Trainees
    {
        return Trainees::where('user_id', $request->user()->id)->firstOrFail();
    }

    protected function ownedTask(Request $request, int|string $id): Task
    {
        $trainee = $this->currentTrainee($request);

        return Task::where('trainee_id', $trainee->id)->findOrFail($id);
    }

    protected function sendResponse(mixed $data, string $message = '', int $statusCode = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }
}
