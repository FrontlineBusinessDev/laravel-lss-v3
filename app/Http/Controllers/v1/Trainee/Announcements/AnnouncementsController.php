<?php

namespace App\Http\Controllers\v1\Trainee\Announcements;

use App\Models\Announcement;
use App\Models\AnnouncementRead;
use App\Models\Trainees;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/** Read-only announcements feed for the logged-in trainee — no store/update/archive/destroy, trainees can't author or mutate announcements. */
class AnnouncementsController
{
    public function index(): Response
    {
        return Inertia::render('trainee/announcements/index')->asCsr();
    }

    /** GET /trainee/announcements-data — paginated feed, newest first. */
    public function list(Request $request): JsonResponse
    {
        $trainee = $this->resolveOwnTrainee();
        $perPage = (int) $request->integer('per_page', 15);

        $readIds = AnnouncementRead::query()
            ->where('trainee_id', $trainee->id)
            ->whereNotNull('read_at')
            ->pluck('announcement_id');

        $paginator = Announcement::query()
            ->visibleToTrainee($trainee->id, $trainee->batch_id)
            ->orderByDesc('scheduled_at')
            ->orderByDesc('created_at')
            ->paginate(max(1, min($perPage, 100)));

        return response()->json([
            'success' => true,
            'data' => [
                'data' => collect($paginator->items())->map(fn (Announcement $a) => [
                    'id' => $a->id,
                    'subject' => $a->subject,
                    'description' => $a->description,
                    'posted_at' => $a->scheduled_at ?? $a->created_at,
                    'is_read' => $readIds->contains($a->id),
                ]),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ],
        ]);
    }

    private function resolveOwnTrainee(): Trainees
    {
        return Trainees::where('user_id', auth()->id())->firstOrFail();
    }
}
