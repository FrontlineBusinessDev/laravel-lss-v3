<?php

namespace App\Http\Controllers\v1\Trainee\Dashboard;

use App\Models\Announcement;
use App\Models\AnnouncementRead;
use App\Models\LeaveRequest;
use App\Models\Task;
use App\Models\TaskRating;
use App\Models\Trainees;
use App\Support\RequiredDocumentTypes;
use App\Support\Statuses;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Trainee Portal landing page — welcome/progress, ongoing tasks, batch
 * announcements, batch-peers-on-leave, and certification eligibility. All
 * queries are scoped to the authenticated trainee's own batch/record.
 */
class DashboardController
{
    public function index(): Response
    {
        $trainee = $this->currentTrainee();
        $trainee->loadMissing('batch:id,batch_code');

        return Inertia::render('trainee/dashboard/index', [
            'trainee' => [
                'first_name' => $trainee->first_name,
                'last_name' => $trainee->last_name,
                'avatar_url' => $trainee->avatar_url,
            ],
            'summary' => $this->buildSummary($trainee),
            'ongoingTasks' => $this->buildOngoingTasks($trainee),
            'announcements' => $this->buildAnnouncements($trainee),
            'onLeave' => $this->buildOnLeave($trainee),
            'eligibility' => $this->computeEligibility($trainee),
        ])->asCsr();
    }

    /** Marks a single announcement read for the current trainee (idempotent). */
    public function markAnnouncementRead(int $id): JsonResponse
    {
        $trainee = $this->currentTrainee();

        AnnouncementRead::updateOrCreate(
            ['announcement_id' => $id, 'trainee_id' => $trainee->id],
            ['read_at' => now()],
        );

        return response()->json(['data' => null]);
    }

    /** @return array<string, mixed> */
    private function buildSummary(Trainees $trainee): array
    {
        $ratingResult = TaskRating::query()
            ->where('trainee_id', $trainee->id)
            ->toBase()
            ->selectRaw('AVG(rating) as average')
            ->first();

        return [
            'required_hours' => (float) $trainee->required_hours,
            'completed_hours' => (float) $trainee->completed_hours,
            'batch_code' => $trainee->batch?->batch_code,
            'average_rating' => $ratingResult->average !== null
                ? round((float) $ratingResult->average, 1)
                : null,
        ];
    }

    /** @return Collection<int, Task> */
    private function buildOngoingTasks(Trainees $trainee): Collection
    {
        return Task::query()
            ->where('trainee_id', $trainee->id)
            ->where('status', 'open')
            ->with('trainer:id,first_name,last_name')
            ->orderByDesc('is_running')
            ->limit(5)
            ->get(['id', 'task', 'description', 'trainer_id', 'status']);
    }

    /** @return Collection<int, mixed> */
    private function buildAnnouncements(Trainees $trainee): Collection
    {
        $readIds = AnnouncementRead::query()
            ->where('trainee_id', $trainee->id)
            ->whereNotNull('read_at')
            ->pluck('announcement_id');

        return Announcement::query()
            ->where('status', Statuses::ACTIVE)
            ->where(function (Builder $query) use ($trainee) {
                $query->where('audience_type', 'all')
                    ->orWhere(function (Builder $q) use ($trainee) {
                        $q->where('audience_type', 'batch')->where('audience_batch_id', $trainee->batch_id);
                    })
                    ->orWhere(function (Builder $q) {
                        $q->where('audience_type', 'role')->where('audience', 'trainee');
                    })
                    ->orWhere(function (Builder $q) use ($trainee) {
                        $q->where('audience_type', 'custom')->whereJsonContains('audience_user_ids', $trainee->id);
                    });
            })
            ->where(function (Builder $query) {
                $query->whereNull('scheduled_at')->orWhere('scheduled_at', '<=', now());
            })
            ->orderByDesc('scheduled_at')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'subject', 'description', 'scheduled_at', 'created_at'])
            ->map(fn(Announcement $a) => [
                'id' => $a->id,
                'subject' => $a->subject,
                'description' => $a->description,
                'posted_at' => $a->scheduled_at ?? $a->created_at,
                'is_read' => $readIds->contains($a->id),
            ]);
    }

    /** @return Collection<int, LeaveRequest> */
    private function buildOnLeave(Trainees $trainee): Collection
    {
        return LeaveRequest::query()
            ->approvedCovering(now()->toDateString())
            ->where('batch_id', $trainee->batch_id)
            ->where('trainee_id', '!=', $trainee->id)
            ->with('trainee:id,first_name,last_name')
            ->get(['id', 'trainee_id', 'leave_date', 'return_date']);
    }

    /** @return array{status: string, reasons: array<int, string>} */
    private function computeEligibility(Trainees $trainee): array
    {
        $hoursOk = (float) $trainee->completed_hours >= (float) $trainee->required_hours;

        $submittedTypes = $trainee->documents()->pluck('document_type')->all();
        $missingDocs = array_values(array_diff(RequiredDocumentTypes::TYPES, $submittedTypes));
        $docsOk = $missingDocs === [];

        $balanceOk = (float) $trainee->outstanding_balance <= 0;

        // TaskRating has no task_id FK (only free-text task_name), so this is
        // a count approximation: every completed task should have a rating.
        $completedTasks = Task::where('trainee_id', $trainee->id)->where('status', 'completed')->count();
        $ratedTasks = TaskRating::where('trainee_id', $trainee->id)->count();
        $evaluationsOk = $ratedTasks >= $completedTasks;

        $statusOk = in_array($trainee->status, [Statuses::ACTIVE, 'completed'], true);

        $reasons = [];
        if (! $hoursOk) {
            $reasons[] = sprintf(
                '%.1f of %.1f required hours completed',
                (float) $trainee->completed_hours,
                (float) $trainee->required_hours,
            );
        }
        foreach ($missingDocs as $type) {
            $reasons[] = ucwords(str_replace('-', ' ', $type)) . ' not submitted';
        }
        if (! $balanceOk) {
            $reasons[] = 'Outstanding balance of ₱' . number_format((float) $trainee->outstanding_balance, 2);
        }
        if (! $evaluationsOk) {
            $reasons[] = 'Required task evaluations not yet completed';
        }
        if (! $statusOk) {
            $reasons[] = 'Trainee status is not active/completed';
        }

        $status = match (true) {
            $hoursOk && $docsOk && $balanceOk && $evaluationsOk && $statusOk => 'eligible',
            ! $balanceOk => 'outstanding_balance',
            ! $statusOk => 'not_eligible',
            default => 'pending_requirements',
        };

        return [
            'status' => $status,
            'reasons' => $reasons,
        ];
    }

    private function currentTrainee(): Trainees
    {
        return Trainees::where('user_id', auth()->id())->firstOrFail();
    }
}
