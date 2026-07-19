<?php

namespace App\Http\Controllers\v1\Trainer\Dashboard;

use App\Models\Announcement;
use App\Models\Batches;
use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\Trainees;
use App\Support\RequiredDocumentTypes;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Trainer home dashboard. Unlike the rest of the app, every widget here is
 * fetched client-side by its own component (see
 * resources/js/api-service-layer/trainer/dashboard.ts) rather than passed as
 * Inertia props — each endpoint below is JSON-only and batch-scoped via
 * ScopesToAssignedBatches.
 */
class DashboardController
{
    use ScopesToAssignedBatches;

    private const UPCOMING_END_WINDOW_DAYS = 14;

    public function index(): Response
    {
        return Inertia::render('trainer/dashboard/index')->asCsr();
    }

    public function metrics(): JsonResponse
    {
        $count = Trainees::whereIn('batch_id', $this->assignedBatchIds())
            ->where('status', 'active')
            ->count();

        return $this->respond(['ongoing_trainees' => $count]);
    }

    public function upcomingEnds(): JsonResponse
    {
        $today = Carbon::today();
        $cutoff = $today->copy()->addDays(self::UPCOMING_END_WINDOW_DAYS);

        $batches = Batches::whereIn('id', $this->assignedBatchIds())
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
        $batchIds = $this->assignedBatchIds();

        $batchEvents = Batches::whereIn('id', $batchIds)
            ->whereBetween('projected_end_date', [$monthStart, $monthEnd])
            ->get(['id', 'batch_code', 'projected_end_date'])
            ->map(fn(Batches $batch) => [
                'id' => 'batch-' . $batch->id,
                'date' => $batch->projected_end_date?->toDateString(),
                'title' => "{$batch->batch_code} projected to end",
                'type' => 'batch',
            ]);

        $leaveEvents = LeaveRequest::where('status', 'approved')
            ->whereIn('batch_id', $batchIds)
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

        $taskEvents = Task::whereIn('batch_id', $batchIds)
            ->whereBetween('date', [$monthStart, $monthEnd])
            ->get(['id', 'task', 'date'])
            ->map(fn(Task $task) => [
                'id' => 'task-' . $task->id,
                'date' => $task->date->toDateString(),
                'title' => $task->task,
                'type' => 'task',
            ]);

        $events = $batchEvents->concat($leaveEvents)->concat($taskEvents)->values();

        return $this->respond($events);
    }

    public function onLeave(): JsonResponse
    {
        $today = Carbon::today()->toDateString();

        $rows = LeaveRequest::approvedCovering($today)
            ->whereIn('batch_id', $this->assignedBatchIds())
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
        $batchIds = $this->assignedBatchIds();

        $baseQuery = Task::whereIn('batch_id', $batchIds)->where('status', '!=', 'completed');

        $total = $baseQuery->clone()->count();

        $rows = $baseQuery->clone()
            ->with(['trainee:id,first_name,last_name', 'batch:id,batch_code'])
            ->orderBy('date')
            ->limit(10)
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

    public function announcements(): JsonResponse
    {
        $rows = Announcement::visibleToTrainer(auth()->id(), $this->assignedBatchIds())
            ->where('status', 'active')
            ->orderByDesc('notified_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'subject', 'description', 'notified_at', 'created_at'])
            ->map(fn(Announcement $announcement) => [
                'id' => $announcement->id,
                'subject' => $announcement->subject,
                'description' => $announcement->description,
                'posted_at' => ($announcement->notified_at ?? $announcement->created_at)->toIso8601String(),
            ]);

        return $this->respond($rows);
    }

    public function documentCompliance(): JsonResponse
    {
        $requiredTypes = RequiredDocumentTypes::TYPES;

        $rows = Trainees::whereIn('batch_id', $this->assignedBatchIds())
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

    private function respond(mixed $data): JsonResponse
    {
        return response()->json(['success' => true, 'message' => '', 'data' => $data]);
    }
}
