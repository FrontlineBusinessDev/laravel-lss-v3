<?php

namespace App\Http\Controllers\v1\Developer\Dashboard;

use App\Http\Controllers\v1\Controller;
use App\Models\Announcement;
use App\Models\Batches;
use App\Models\BehavioralEvaluation;
use App\Models\Trainees;
use App\Models\TraineesPayments;
use App\Support\Statuses;
use App\Traits\HasDashboardWidgets;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin/Developer home dashboard. Every widget is fetched client-side by its
 * own component (see resources/js/api-service-layer/admin/dashboard.ts)
 * rather than passed as Inertia props — mirrors the Trainer Dashboard's
 * pattern (app/Http/Controllers/v1/Trainer/Dashboard/DashboardController.php)
 * but unscoped, since admins/developers see every batch and trainee. Shared
 * widget logic lives in App\Traits\HasDashboardWidgets.
 */
class DashboardController extends Controller
{
    use HasDashboardWidgets;

    protected function dashboardBatchIds(): ?array
    {
        return null;
    }

    protected function dashboardTaskLimit(): int
    {
        return 5;
    }

    protected function dashboardIncludesHolidays(): bool
    {
        return true;
    }

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

        $ratingRow = BehavioralEvaluation::whereNotNull('total_score')
            ->selectRaw('AVG(total_score) as average, COUNT(*) as total')
            ->first();

        return $this->respond([
            'total_batches' => Batches::count(),
            'active_batches' => Batches::where('status', 'active')->count(),
            'total_trainees' => Trainees::count(),
            'ongoing_trainees' => Trainees::where('status', 'active')->count(),
            'total_earnings' => (float) $totalEarnings,
            'average_rating' => round((float) ($ratingRow?->average ?? 0), 1),
            'total_ratings' => (int) ($ratingRow?->total ?? 0),
        ]);
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
            'active' => (int) ($counts[Statuses::ACTIVE] ?? 0),
            'completed' => (int) ($counts['completed'] ?? 0),
            'terminated' => (int) ($counts[Statuses::TERMINATED] ?? 0),
            'archived' => (int) ($counts[Statuses::INACTIVE] ?? 0),
        ]);
    }

    public function recentBatches(): JsonResponse
    {
        $rows = Batches::latest()
            ->take(4)
            ->with('academicProgramType:id,name')
            ->get(['id', 'batch_code', 'status', 'academic_program_type_id'])
            ->map(fn(Batches $batch) => [
                'id' => $batch->id,
                'batch_code' => $batch->batch_code,
                'status' => $batch->status,
                'program_type' => $batch->academicProgramType?->name,
            ]);

        return $this->respond($rows);
    }
}
