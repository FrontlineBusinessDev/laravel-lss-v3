<?php

namespace App\Http\Controllers\v1\Developer\Tasks;

use App\Http\Controllers\v1\Developer\Controller;
use App\Http\Responses\InertiaPageResponse;
use App\Models\LeaveRequest;
use App\Models\Task;
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

        $tasks = Task::query()
            ->where('status', 'completed')
            ->with(['batch:id,batch_code', 'trainee:id,first_name,last_name', 'trainer:id,first_name,last_name'])
            ->when($validated['date_from'] ?? null, fn($q, $date) => $q->whereDate('date', '>=', $date))
            ->when($validated['date_to'] ?? null, fn($q, $date) => $q->whereDate('date', '<=', $date))
            ->when($validated['batch_id'] ?? null, fn($q, $id) => $q->where('batch_id', $id))
            ->when($validated['trainee_ids'] ?? null, fn($q, $ids) => $q->whereIn('trainee_id', $ids))
            ->when($validated['trainer_ids'] ?? null, fn($q, $ids) => $q->whereIn('trainer_id', $ids))
            ->orderBy('date')
            ->get();

        // Bulk-fetch approved leaves for every trainee involved, once, so the
        // per-row leave check below never issues a query per row.
        $traineeIds = $tasks->pluck('trainee_id')->unique()->values();
        $leaves = LeaveRequest::where('status', 'approved')
            ->whereIn('trainee_id', $traineeIds)
            ->get(['trainee_id', 'leave_type', 'leave_date', 'return_date', 'reason']);

        $rows = $tasks->map(function (Task $task) use ($leaves) {
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

        return response()->json(['data' => $rows]);
    }
}
