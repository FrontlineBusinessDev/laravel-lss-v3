<?php

namespace App\Http\Controllers\v1\Developer\Tasks;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Tasks CRUD API (prefix /tasks). Task's lifecycle (open -> completed -> locked)
 * doesn't fit BaseController's active/inactive archive semantics, so store(),
 * destroy() are overridden and archive()/restore() are left unused/unrouted.
 */
class TasksController extends BaseController
{
    protected string $model = Task::class;
    protected string $view = 'developer/tasks/index';
    protected array $searchable = ['task'];
    protected array $filterable = ['status', 'batch_id', 'trainee_id', 'trainer_id', 'date'];
    protected array $exactFilters = ['status', 'batch_id', 'trainee_id', 'trainer_id', 'date'];
    protected array $sortable = ['date', 'status', 'created_at'];
    protected string $sortBy = 'date';
    protected array $activeColumns = ['id', 'task'];

    protected function newQuery(): Builder
    {
        return parent::newQuery()->with([
            'batch:id,batch_code',
            'trainee:id,first_name,last_name',
            'trainer:id,first_name,last_name',
        ]);
    }

    protected function storeRules(): array
    {
        return [
            'date' => ['required', 'date'],
            'batch_id' => ['required', 'exists:app_batches,id'],
            'trainee_id' => ['required', 'exists:app_trainees,id'],
            'trainer_id' => ['required', 'exists:users,id'],
            'task' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'time_goal' => ['required', 'numeric', 'min:0.5'],
        ];
    }

    protected function updateRules(Model $model): array
    {
        return $this->storeRules();
    }

    /** Tasks always start Open with no time logged — not the active/inactive default from BaseController::store(). */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', $this->model);
        $validated = $request->validate($this->storeRules(), $this->validationMessages());

        $task = Task::create([
            ...$validated,
            'status' => 'open',
            'time_spent' => 0,
        ]);

        return $this->sendResponse($this->resolveModel($task->id), 'Task created successfully.', 201);
    }

    /** Mark a task complete — locks in the trainee's time spent for reporting. */
    public function completeAction(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        abort_if($model->status === 'locked', 422, 'Locked tasks can no longer be edited or completed.');

        $model->update(['status' => 'completed', 'completed_at' => now()]);

        return $this->sendResponse($model, 'Task marked as complete.');
    }

    /** Lock a task — no further edits or completion allowed. */
    public function lockAction(int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);

        $model->update(['status' => 'locked', 'locked_at' => now()]);

        return $this->sendResponse($model, 'Task locked.');
    }

    /** Trainer/admin remarks on the task — blocked while the trainee is on approved leave for that date. */
    public function updateRemarks(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $validated = $request->validate(['remarks' => ['nullable', 'string']]);

        abort_if($this->leaveFor($model) !== null, 422, 'Remarks are locked while the trainee is on approved leave for this date.');

        $model->update(['remarks' => $validated['remarks']]);

        return $this->sendResponse($model, 'Remarks saved.');
    }

    /** Inline Time Spent edit from the Daily Task Sheet — same leave guard as remarks. */
    public function updateTimeSpent(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $validated = $request->validate(['time_spent' => ['required', 'numeric', 'min:0']]);

        abort_if($this->leaveFor($model) !== null, 422, 'Time spent is locked while the trainee is on approved leave for this date.');

        $model->update(['time_spent' => $validated['time_spent']]);

        return $this->sendResponse($model, 'Time spent updated.');
    }

    /**
     * Hard-delete with confirm — BaseController::destroy() only allows deleting
     * already-inactive records, which doesn't apply to Task's open/completed/locked
     * lifecycle. No records reference app_tasks, so no in-use guard is needed.
     */
    public function destroy(int|string $id): JsonResponse
    {
        return DB::transaction(function () use ($id) {
            $model = $this->newQuery()->lockForUpdate()->findOrFail($id);
            $this->authorize('delete', $model);

            $model->delete();

            return response()->json(null, 204);
        });
    }

    /** Trainer option list for the Add Task modal — users with the `trainer` role. */
    public function trainers(): JsonResponse
    {
        $trainers = User::role('trainer')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name']);

        return $this->sendResponse($trainers);
    }

    /** Approved leave (if any) covering this task's date, for the trainee this task belongs to. */
    protected function leaveFor(Task $task): ?LeaveRequest
    {
        return LeaveRequest::approvedCovering($task->date->toDateString())
            ->where('trainee_id', $task->trainee_id)
            ->first();
    }
}
