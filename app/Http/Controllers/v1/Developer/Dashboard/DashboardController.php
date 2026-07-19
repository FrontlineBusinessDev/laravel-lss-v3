<?php

namespace App\Http\Controllers\v1\Developer\Dashboard;

use App\Http\Controllers\v1\Developer\Controller;
use App\Models\Announcement;
use App\Models\Batches;
use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\Trainees;
use App\Models\TraineesPayments;
use App\Support\RequiredDocumentTypes;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin/Developer home dashboard. Every widget is fetched client-side by its
 * own component (see resources/js/api-service-layer/admin/dashboard.ts)
 * rather than passed as Inertia props — mirrors the Trainer Dashboard's
 * pattern (app/Http/Controllers/v1/Trainer/Dashboard/DashboardController.php)
 * but unscoped, since admins/developers see every batch and trainee.
 */
class DashboardController extends Controller
{
    private const UPCOMING_END_WINDOW_DAYS = 14;

    public function index(): Response
    {
        return Inertia::render('developer/dashboard/index')->asCsr();
    }

    public function metrics(): JsonResponse
    {
        $totalEarnings = TraineesPayments::whereBetween('payment_date', [
            Carbon::now()->startOfYear(),
            Carbon::now(),
        ])->sum('amount_paid');

        return $this->respond([
            'total_batches' => Batches::count(),
            'active_batches' => Batches::where('status', 'active')->count(),
            'total_trainees' => Trainees::count(),
            'ongoing_trainees' => Trainees::where('status', 'active')->count(),
            'total_earnings' => (float) $totalEarnings,
        ]);
    }

    public function upcomingEnds(): JsonResponse
    {
        $today = Carbon::today();
        $cutoff = $today->copy()->addDays(self::UPCOMING_END_WINDOW_DAYS);

        $batches = Batches::whereBetween('projected_end_date', [$today, $cutoff])
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

        $batchEvents = Batches::whereBetween('projected_end_date', [$monthStart, $monthEnd])
            ->get(['id', 'batch_code', 'projected_end_date'])
            ->map(fn(Batches $batch) => [
                'id' => 'batch-' . $batch->id,
                'date' => $batch->projected_end_date?->toDateString(),
                'title' => "{$batch->batch_code} projected to end",
                'type' => 'batch',
            ]);

        $leaveEvents = LeaveRequest::where('status', 'approved')
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

        $taskEvents = Task::whereBetween('date', [$monthStart, $monthEnd])
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
        $baseQuery = Task::where('status', '!=', 'completed');

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
        $rows = Announcement::where('status', 'active')
            ->with('creator:id,first_name,last_name')
            ->orderByDesc('notified_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'subject', 'description', 'notified_at', 'created_at', 'created_by_id'])
            ->map(fn(Announcement $announcement) => [
                'id' => $announcement->id,
                'subject' => $announcement->subject,
                'description' => $announcement->description,
                'posted_at' => ($announcement->notified_at ?? $announcement->created_at)->toIso8601String(),
                'posted_by' => $announcement->creator
                    ? trim($announcement->creator->first_name . ' ' . $announcement->creator->last_name)
                    : null,
            ]);

        return $this->respond($rows);
    }

    public function documentCompliance(): JsonResponse
    {
        $requiredTypes = RequiredDocumentTypes::TYPES;

        $rows = Trainees::where('status', 'active')
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

    public function traineeGrowth(): JsonResponse
    {
        // Grouped in PHP rather than via SQL YEAR()/strftime() so this works
        // identically across the sqlite (local) and mysql (prod) drivers.
        $rows = Trainees::select('created_at')
            ->get()
            ->groupBy(fn(Trainees $trainee) => $trainee->created_at->format('Y'))
            ->map(fn($group, $year) => [
                'year' => (string) $year,
                'count' => $group->count(),
            ])
            ->sortBy('year')
            ->values();

        return $this->respond($rows);
    }

    public function traineeStatusBreakdown(): JsonResponse
    {
        $counts = Trainees::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        return $this->respond([
            'active' => (int) ($counts['active'] ?? 0),
            'completed' => (int) ($counts['completed'] ?? 0),
            'terminated' => (int) ($counts['terminated'] ?? 0),
            'archived' => (int) ($counts['archived'] ?? 0),
        ]);
    }

    public function recentBatches(): JsonResponse
    {
        $rows = Batches::latest()
            ->take(4)
            ->with('academicProgram:id,name')
            ->get(['id', 'batch_code', 'status', 'academic_program_id'])
            ->map(fn(Batches $batch) => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'status' => $batch->status,
                'program_type' => $batch->academicProgram?->name,
            ]);

        return $this->respond($rows);
    }

    private function respond(mixed $data): JsonResponse
    {
        return response()->json(['success' => true, 'message' => '', 'data' => $data]);
    }
}
