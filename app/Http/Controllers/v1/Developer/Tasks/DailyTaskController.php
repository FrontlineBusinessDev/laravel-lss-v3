<?php

namespace App\Http\Controllers\v1\Developer\Tasks;

use App\Http\Controllers\v1\Developer\Controller;
use App\Http\Responses\InertiaPageResponse;
use App\Models\LeaveRequest;
use App\Models\Task;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Response;

/**
 * Daily Task Sheet report (prefix /daily-task). A read-mostly reporting
 * surface over completed Tasks, not a CRUD resource — inline Time Spent /
 * Remarks edits reuse TasksController's endpoints so the leave-guard logic
 * only lives in one place.
 */
class DailyTaskController extends Controller
{
    use ScopesToAssignedBatches;


    public function index(): Response
    {
        return InertiaPageResponse::csr('developer/tasks/daily-task');
    }

    public function list(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date'],
            'batch_id' => ['nullable', 'integer', 'exists:app_batches,id'],
            'trainee_ids' => ['nullable', 'array'],
            'trainee_ids.*' => ['integer', 'exists:app_trainees,id'],
            'trainer_ids' => ['nullable', 'array'],
            'trainer_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $tasks = $this->filteredQuery($validated)->orderBy('date')->get();

        return response()->json(['data' => $this->toRows($tasks)]);
    }

    /**
     * Server-paginated counterpart of list(), feeding <DataTableCardField>'s
     * on-screen table. Reads filters from the `filters[...]` envelope the
     * component sends (date-range → date_from/date_to, async-select →
     * batch_id, async-multi-select → trainee_id[]/trainer_id[]) rather than
     * list()'s flat query params.
     */
    public function paginationSearch(Request $request): JsonResponse
    {
        $filters = (array) $request->input('filters', []);

        $criteria = [
            'date_from' => $filters['date_from'] ?? null,
            'date_to' => $filters['date_to'] ?? null,
            'batch_id' => $filters['batch_id'] ?? null,
            'trainee_ids' => array_values(array_filter((array) ($filters['trainee_id'] ?? []), fn($v) => $v !== '' && $v !== null)),
            'trainer_ids' => array_values(array_filter((array) ($filters['trainer_id'] ?? []), fn($v) => $v !== '' && $v !== null)),
        ];

        $sortDir = $request->string('sort_dir', 'asc')->toString() === 'desc' ? 'desc' : 'asc';
        $query = $this->filteredQuery($criteria)->orderBy('date', $sortDir);

        $perPage = max(1, min((int) $request->input('per_page', 10), 100));
        $paginator = $query->paginate($perPage, ['*'], 'page', (int) $request->input('page', 1));

        return response()->json([
            'success' => true,
            'message' => '',
            'data' => [
                'data' => $this->toRows(collect($paginator->items())),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                    'from' => $paginator->firstItem(),
                    'to' => $paginator->lastItem(),
                ],
            ],
        ]);
    }

    /**
     * @param array{date_from?: ?string, date_to?: ?string, batch_id?: ?int, trainee_ids?: array, trainer_ids?: array} $filters
     */
    private function filteredQuery(array $filters): \Illuminate\Database\Eloquent\Builder
    {
        /** @disregard P1013 */
        $user = auth()->user();
        $isTrainerOnly = $user->hasRole('trainer') && ! $user->hasAnyRole(['admin', 'developer']);

        return Task::query()
            ->where('status', 'completed')
            ->with(['batch:id,batch_code', 'trainee:id,first_name,last_name', 'trainer:id,first_name,last_name'])
            ->when($filters['date_from'] ?? null, fn($q, $date) => $q->whereDate('date', '>=', $date))
            ->when($filters['date_to'] ?? null, fn($q, $date) => $q->whereDate('date', '<=', $date))
            ->when($filters['batch_id'] ?? null, fn($q, $id) => $q->where('batch_id', $id))
            ->when($filters['trainee_ids'] ?? null, fn($q, $ids) => $q->whereIn('trainee_id', $ids))
            ->when($filters['trainer_ids'] ?? null, fn($q, $ids) => $q->whereIn('trainer_id', $ids))
            ->when($isTrainerOnly, fn($q) => $q->whereIn('batch_id', $this->assignedBatchIds()));
    }

    /**
     * @param \Illuminate\Support\Collection<int, Task> $tasks
     */
    private function toRows(\Illuminate\Support\Collection $tasks): \Illuminate\Support\Collection
    {
        // Bulk-fetch approved leaves for every trainee involved, once, so the
        // per-row leave check below never issues a query per row.
        $traineeIds = $tasks->pluck('trainee_id')->unique()->values();
        $leaves = LeaveRequest::where('status', 'approved')
            ->whereIn('trainee_id', $traineeIds)
            ->get(['trainee_id', 'leave_type', 'leave_date', 'return_date', 'reason']);

        return $tasks->map(function (Task $task) use ($leaves) {
            $leave = $leaves->first(fn($l) => $l->trainee_id === $task->trainee_id
                && $task->date->toDateString() >= $l->leave_date->toDateString()
                && $task->date->toDateString() <= $l->return_date->toDateString());

            return [
                'id' => $task->id,
                'batch_code' => $task->batch?->batch_code,
                'task' => $task->task,
                'description' => $task->description,
                'time_goal' => (float) $task->time_goal,
                'time_spent' => $leave ? 0 : (float) $task->time_spent,
                'remarks' => $leave ? $leave->leave_type . ': ' . $leave->reason : $task->remarks,
                'trainee' => trim($task->trainee?->first_name . ' ' . $task->trainee?->last_name),
                'trainer' => trim($task->trainer?->first_name . ' ' . $task->trainer?->last_name),
                'date' => $task->date->toDateString(),
                'on_leave' => (bool) $leave,
                'leave_reason' => $leave ? $leave->leave_type . ': ' . $leave->reason : null,
            ];
        })->values();
    }
}
