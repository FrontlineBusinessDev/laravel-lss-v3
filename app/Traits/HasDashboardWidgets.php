<?php

namespace App\Traits;

use App\Models\Batches;
use App\Models\Holiday;
use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\Trainees;
use App\Support\RequiredDocumentTypes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Shared home-dashboard widgets used identically by the Developer and Trainer
 * dashboards, differing only in whether they're scoped to a set of batch ids.
 * `dashboardBatchIds()` returns null for an unscoped (developer/admin) view,
 * or an array of assigned batch ids for a scoped (trainer) view.
 */
trait HasDashboardWidgets
{
    private const UPCOMING_END_WINDOW_DAYS = 14;

    abstract protected function dashboardBatchIds(): ?array;

    abstract protected function dashboardTaskLimit(): int;

    abstract protected function dashboardIncludesHolidays(): bool;

    protected function respond(mixed $data): JsonResponse
    {
        return response()->json(['success' => true, 'message' => '', 'data' => $data]);
    }

    public function upcomingEnds(): JsonResponse
    {
        $today = Carbon::today();
        $cutoff = $today->copy()->addDays(self::UPCOMING_END_WINDOW_DAYS);
        $batchIds = $this->dashboardBatchIds();

        $batches = Batches::when($batchIds !== null, fn($q) => $q->whereIn('id', $batchIds))
            ->whereBetween('projected_end_date', [$today, $cutoff])
            ->withCount('trainees')
            ->orderBy('projected_end_date')
            ->get()
            ->map(fn(Batches $batch) => [
                'batch_id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'projected_end_date' => $batch->projected_end_date?->toDateString(),
                'trainee_count' => $batch->trainees_count,
            ]);

        return $this->respond($batches);
    }

    public function calendarEvents(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'month' => ['required', 'date_format:Y-m'],
        ]);

        $monthStart = Carbon::createFromFormat('Y-m-d', $validated['month'] . '-01')->startOfMonth();
        $monthEnd = $monthStart->copy()->endOfMonth();
        $batchIds = $this->dashboardBatchIds();

        $batchEvents = Batches::when($batchIds !== null, fn($q) => $q->whereIn('id', $batchIds))
            ->whereBetween('projected_end_date', [$monthStart, $monthEnd])
            ->get(['id', 'batch_code', 'projected_end_date'])
            ->map(fn(Batches $batch) => [
                'id' => 'batch-' . $batch->id,
                'date' => $batch->projected_end_date?->toDateString(),
                'title' => "{$batch->batch_code} projected to end",
                'type' => 'batch',
            ]);

        $leaveEvents = LeaveRequest::where('status', 'approved')
            ->when($batchIds !== null, fn($q) => $q->whereIn('batch_id', $batchIds))
            ->whereDate('leave_date', '<=', $monthEnd)
            ->whereDate('return_date', '>=', $monthStart)
            ->with('trainee:id,first_name,last_name')
            ->get()
            ->map(fn(LeaveRequest $leave) => [
                'id' => 'leave-' . $leave->id,
                'date' => $leave->leave_date->toDateString(),
                'title' => trim($leave->trainee?->first_name . ' ' . $leave->trainee?->last_name) . ' on leave',
                'type' => 'leave',
            ]);

        $taskEvents = Task::when($batchIds !== null, fn($q) => $q->whereIn('batch_id', $batchIds))
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->get(['id', 'task', 'date'])
            ->map(fn(Task $task) => [
                'id' => 'task-' . $task->id,
                'date' => $task->date->toDateString(),
                'title' => $task->task,
                'type' => 'task',
            ]);

        $events = $batchEvents->concat($leaveEvents)->concat($taskEvents);

        if ($this->dashboardIncludesHolidays()) {
            $holidayEvents = Holiday::whereBetween('date', [$monthStart, $monthEnd])
                ->get(['id', 'name', 'date'])
                ->map(fn(Holiday $holiday) => [
                    'id' => 'holiday-' . $holiday->id,
                    'date' => $holiday->date->toDateString(),
                    'title' => $holiday->name,
                    'type' => 'holiday',
                ]);

            $events = $events->concat($holidayEvents);
        }

        return $this->respond($events->values());
    }

    public function onLeave(): JsonResponse
    {
        $today = Carbon::today()->toDateString();
        $batchIds = $this->dashboardBatchIds();

        $rows = LeaveRequest::approvedCovering($today)
            ->when($batchIds !== null, fn($q) => $q->whereIn('batch_id', $batchIds))
            ->with(['trainee:id,first_name,last_name', 'batch:id,batch_code', 'leaveCategory:id,name'])
            ->orderBy('return_date')
            ->get()
            ->map(fn(LeaveRequest $leave) => [
                'trainee_id' => $leave->trainee_id,
                'name' => trim($leave->trainee?->first_name . ' ' . $leave->trainee?->last_name),
                'batch_code' => $leave->batch?->batch_code,
                'leave_type' => $leave->leaveCategory?->name,
                'return_date' => $leave->return_date->toDateString(),
            ]);

        return $this->respond($rows);
    }

    public function ongoingTasks(): JsonResponse
    {
        $batchIds = $this->dashboardBatchIds();

        $baseQuery = Task::when($batchIds !== null, fn($q) => $q->whereIn('batch_id', $batchIds))
            ->where('status', '!=', 'completed');

        $total = $baseQuery->clone()->count();

        $rows = $baseQuery->clone()
            ->with(['trainee:id,first_name,last_name', 'batch:id,batch_code'])
            ->orderBy('date')
            ->limit($this->dashboardTaskLimit())
            ->get()
            ->map(fn(Task $task) => [
                'id' => $task->id,
                'task' => $task->task,
                'trainee_name' => trim($task->trainee?->first_name . ' ' . $task->trainee?->last_name),
                'batch_code' => $task->batch?->batch_code,
                'date' => $task->date->toDateString(),
                'status' => $task->status,
                'priority' => $task->priority,
            ]);

        return $this->respond(['tasks' => $rows, 'total' => $total]);
    }

    public function documentCompliance(): JsonResponse
    {
        $requiredTypes = RequiredDocumentTypes::TYPES;
        $batchIds = $this->dashboardBatchIds();

        $rows = Trainees::when($batchIds !== null, fn($q) => $q->whereIn('batch_id', $batchIds))
            ->where('status', 'active')
            ->with(['batch:id,batch_code', 'documents:trainee_id,document_type'])
            ->get()
            ->map(function (Trainees $trainee) use ($requiredTypes) {
                $ownedTypes = $trainee->documents->pluck('document_type')->all();
                $missing = array_values(array_diff($requiredTypes, $ownedTypes));

                return $missing === [] ? null : [
                    'trainee_id' => $trainee->id,
                    'name' => trim($trainee->first_name . ' ' . $trainee->last_name),
                    'batch_code' => $trainee->batch?->batch_code,
                    'missing_types' => $missing,
                ];
            })
            ->filter()
            ->values();

        return $this->respond($rows);
    }
}
