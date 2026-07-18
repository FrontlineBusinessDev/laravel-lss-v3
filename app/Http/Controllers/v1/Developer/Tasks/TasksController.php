<?php

namespace App\Http\Controllers\v1\Developer\Tasks;

use App\Http\Controllers\v1\Developer\BaseController;
use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\User;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Tasks CRUD API (prefix /tasks). Task's lifecycle (open -> completed -> locked)
 * doesn't fit BaseController's active/inactive archive semantics, so store(),
 * destroy() are overridden and archive()/restore() are left unused/unrouted.
 */
class TasksController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = Task::class;
    protected string $view = 'developer/tasks/index';
    protected array $searchable = ['task'];
    protected array $filterable = ['status', 'priority', 'batch_id', 'trainee_id', 'trainer_id', 'date_from', 'date_to'];
    protected array $exactFilters = ['status', 'priority', 'batch_id', 'trainee_id', 'trainer_id'];
    protected array $sortable = ['date', 'status', 'created_at'];
    protected string $sortBy = 'date';
    protected array $activeColumns = ['id', 'task'];

    protected function newQuery(): Builder
    {
        $query = parent::newQuery()->with([
            'batch:id,batch_code',
            'trainee:id,first_name,last_name',
            'trainer:id,first_name,last_name',
        ]);

        return $this->scopeTrainerBatches($query, 'batch_id');
    }

    /**
     * Trainer holds `manage tasks` (RoleSeeder) same as admin/developer, but
     * must only ever see/mutate tasks in their own assigned batches. No-op
     * for admin/developer.
     */
    protected function scopeTrainerBatches(Builder $query, string $batchColumn): Builder
    {
        /** @disregard P1013 */
        $user = auth()->user();
        if ($user->hasRole('trainer') && ! $user->hasAnyRole(['admin', 'developer'])) {
            return $query->whereIn($batchColumn, $this->assignedBatchIds());
        }

        return $query;
    }

    /**
     * Overrides BaseController::paginationSearch() — Task's filter panel needs
     * multi-value (whereIn) filters on batch/trainee/trainer, a date_from/
     * date_to range on `date`, and a 5-column default sort across joined
     * tables, none of which the generic implementation supports.
     */
    public function paginationSearch(Request $request): JsonResponse
    {
        $search = $request->string('search')->toString();
        $filters = (array) $request->input('filters', []);
        $sortByParam = $request->string('sort_by')->toString();
        $sortDir = $request->string('sort_dir', 'asc')->toString() === 'desc' ? 'desc' : 'asc';

        $query = Task::query()
            ->select('app_tasks.*')
            ->leftJoin('app_batches', 'app_batches.id', '=', 'app_tasks.batch_id')
            ->leftJoin('app_trainees', 'app_trainees.id', '=', 'app_tasks.trainee_id')
            ->leftJoin('users as trainer_users', 'trainer_users.id', '=', 'app_tasks.trainer_id')
            ->with([
                'batch:id,batch_code',
                'trainee:id,first_name,last_name',
                'trainer:id,first_name,last_name',
            ]);
        $query = $this->scopeTrainerBatches($query, 'app_tasks.batch_id');

        if ($search !== '') {
            $query->where('app_tasks.task', 'like', "%{$search}%");
        }

        $status = $filters['status'] ?? null;
        if ($status !== null && $status !== '') {
            $query->where('app_tasks.status', $status);
        }

        foreach (['priority', 'batch_id', 'trainee_id', 'trainer_id'] as $col) {
            $value = $filters[$col] ?? null;
            if ($value === null || $value === '') {
                continue;
            }
            if (is_array($value)) {
                $clean = array_values(array_filter($value, fn($v) => $v !== null && $v !== ''));
                if ($clean) {
                    $query->whereIn("app_tasks.{$col}", $clean);
                }
            } else {
                $query->where("app_tasks.{$col}", $value);
            }
        }

        if (! empty($filters['date_from'])) {
            $query->whereDate('app_tasks.date', '>=', $filters['date_from']);
        }
        if (! empty($filters['date_to'])) {
            $query->whereDate('app_tasks.date', '<=', $filters['date_to']);
        }

        if ($sortByParam !== '' && in_array($sortByParam, $this->sortable, true)) {
            $query->orderBy("app_tasks.{$sortByParam}", $sortDir);
        } else {
            // Default order: date_created desc, batch_code asc, task asc, trainee name asc, trainer name asc.
            $query->orderBy('app_tasks.created_at', 'desc')
                ->orderBy('app_batches.batch_code', 'asc')
                ->orderBy('app_tasks.task', 'asc')
                ->orderByRaw("CONCAT(app_trainees.first_name, ' ', app_trainees.last_name) asc")
                ->orderByRaw("CONCAT(trainer_users.first_name, ' ', trainer_users.last_name) asc");
        }

        $perPage = (int) $request->input('per_page', 10);
        $paginator = $query->paginate(max(1, min($perPage, 100)));

        $paginatedData = [
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
            'filterable' => $this->filterable,
            'searchable' => $this->searchable,
            'filters' => $filters,
            'search' => $search,
            'sort_by' => $sortByParam,
            'sort_dir' => $sortDir,
        ];

        return $this->sendResponse($paginatedData);
    }

    /** Create accepts trainee_ids (plural) — one Task row is fanned out per selected trainee. */
    protected function storeRules(): array
    {
        /** @disregard P1013 */
        $user = auth()->user();
        $isTrainerOnly = $user->hasRole('trainer') && ! $user->hasAnyRole(['admin', 'developer']);

        return [
            'date' => ['required', 'date'],
            'batch_id' => [
                'required',
                'exists:app_batches,id',
                ...($isTrainerOnly ? [Rule::in($this->assignedBatchIds())] : []),
            ],
            'trainee_ids' => ['required', 'array', 'min:1'],
            'trainee_ids.*' => [
                'integer',
                Rule::exists('app_trainees', 'id')->where(fn($q) => $q->where('batch_id', request()->input('batch_id'))),
            ],
            // trainer_id is still validated here so admin's payload shape stays
            // unchanged; store() below forces it to auth()->id() for trainers.
            'trainer_id' => ['required', 'exists:users,id'],
            'task' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'time_goal' => ['required', 'numeric', 'min:0.5'],
            'priority' => ['nullable', 'in:high,medium,low'],
        ];
    }

    /** Edit always operates on a single already-created row — trainee_id (singular), any status. */
    protected function updateRules(Model $model): array
    {
        /** @disregard P1013 */
        $user = auth()->user();
        $isTrainerOnly = $user->hasRole('trainer') && ! $user->hasAnyRole(['admin', 'developer']);

        return [
            'date' => ['required', 'date'],
            'batch_id' => [
                'required',
                'exists:app_batches,id',
                ...($isTrainerOnly ? [Rule::in($this->assignedBatchIds())] : []),
            ],
            'trainee_id' => [
                'required',
                Rule::exists('app_trainees', 'id')->where(fn($q) => $q->where('batch_id', request()->input('batch_id'))),
            ],
            'trainer_id' => ['required', 'exists:users,id'],
            'task' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'time_goal' => ['required', 'numeric', 'min:0.5'],
            'priority' => ['nullable', 'in:high,medium,low'],
        ];
    }

    /**
     * Bulk fan-out create: one Task row per selected trainee, same batch/
     * trainer/task/description/time_goal/date. No pivot table — the app_tasks
     * schema stays one-trainee-per-row, so "assign to 3 trainees" simply
     * creates 3 independent rows.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', $this->model);
        $validated = $request->validate($this->storeRules(), $this->validationMessages());

        /** @disregard P1013 */
        $user = auth()->user();
        if ($user->hasRole('trainer') && ! $user->hasAnyRole(['admin', 'developer'])) {
            $validated['trainer_id'] = $user->id;
        }

        $ids = DB::transaction(function () use ($validated) {
            return collect($validated['trainee_ids'])->map(function ($traineeId) use ($validated) {
                return Task::create([
                    'date' => $validated['date'],
                    'batch_id' => $validated['batch_id'],
                    'trainee_id' => $traineeId,
                    'trainer_id' => $validated['trainer_id'],
                    'task' => $validated['task'],
                    'description' => $validated['description'] ?? null,
                    'time_goal' => $validated['time_goal'],
                    'priority' => $validated['priority'] ?? null,
                    'status' => 'open',
                    'time_spent' => 0,
                ])->id;
            });
        });

        $records = $this->newQuery()->whereIn('id', $ids)->get();

        return $this->sendResponse($records, 'Task(s) created successfully.', 201);
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

    /** Trainer/admin remarks on the task — blocked while Locked or while the trainee is on approved leave for that date. */
    public function updateRemarks(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $validated = $request->validate(['remarks' => ['nullable', 'string']]);

        $this->assertTimeEntryEditable($model);

        $model->update(['remarks' => $validated['remarks']]);

        return $this->sendResponse($model, 'Remarks saved.');
    }

    /**
     * Inline Time Spent edit from the Daily Task Sheet. Blocked while Locked —
     * this is the "lock blocks the trainee's timer" rule, enforced here since
     * time_spent is the only time-tracking field that exists — and blocked
     * while the trainee is on approved leave for that date.
     */
    public function updateTimeSpent(Request $request, int|string $id): JsonResponse
    {
        $model = $this->resolveModel($id);
        $this->authorize('update', $model);
        $validated = $request->validate(['time_spent' => ['required', 'numeric', 'min:0']]);

        $this->assertTimeEntryEditable($model);

        $model->update(['time_spent' => $validated['time_spent']]);

        return $this->sendResponse($model, 'Time spent updated.');
    }

    /** Shared guard for updateTimeSpent()/updateRemarks(): blocked when Locked or on approved leave. */
    protected function assertTimeEntryEditable(Task $model): void
    {
        abort_if($model->status === 'locked', 422, 'This task is locked and can no longer be edited.');
        abort_if($this->leaveFor($model) !== null, 422, 'This field is locked while the trainee is on approved leave for this date.');
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
