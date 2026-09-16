<?php

namespace App\Http\Controllers\v1\Trainer\Dashboard;

use App\Http\Controllers\v1\ApiController;
use App\Models\Announcement;
use App\Models\Trainees;
use App\Traits\HasDashboardWidgets;
use App\Traits\ScopesToAssignedBatches;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Trainer home dashboard. Unlike the rest of the app, every widget here is
 * fetched client-side by its own component (see
 * resources/js/api-service-layer/trainer/dashboard.ts) rather than passed as
 * Inertia props — each endpoint below is JSON-only and batch-scoped via
 * ScopesToAssignedBatches. Shared widget logic lives in
 * App\Traits\HasDashboardWidgets.
 */
class DashboardController extends ApiController
{
    use HasDashboardWidgets, ScopesToAssignedBatches;

    protected function dashboardBatchIds(): ?array
    {
        return $this->assignedBatchIds();
    }

    protected function dashboardTaskLimit(): int
    {
        return 10;
    }

    protected function dashboardIncludesHolidays(): bool
    {
        return false;
    }

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
}
