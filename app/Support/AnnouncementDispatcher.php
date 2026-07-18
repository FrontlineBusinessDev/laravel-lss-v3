<?php

namespace App\Support;

use App\Models\Announcement;
use App\Models\Notification;
use App\Models\Trainees;
use App\Models\User;

/**
 * Resolves an announcement's `audience_type` into concrete recipient user
 * ids and creates their in-app Notification rows. Shared by
 * AnnoucementController (dispatch on create) and the
 * announcements:dispatch-scheduled command (dispatch once scheduled_at passes).
 */
class AnnouncementDispatcher
{
    /**
     * Dispatches now if unscheduled or already due; otherwise leaves
     * `notified_at` null for the scheduled command to pick up later.
     */
    public static function maybeDispatch(Announcement $announcement): void
    {
        if ($announcement->notified_at !== null) {
            return;
        }
        if ($announcement->scheduled_at !== null && $announcement->scheduled_at->isFuture()) {
            return;
        }

        foreach (self::resolveAudienceUserIds($announcement) as $userId) {
            Notification::create([
                'user_id' => $userId,
                'type' => 'announcement.published',
                'title' => 'New announcement',
                'body' => $announcement->subject,
                'data' => ['announcement_id' => $announcement->id],
            ]);
        }

        $announcement->update(['notified_at' => now()]);
    }

    /**
     * Resolves audience_type into a concrete list of recipient user ids.
     *
     * @return array<int, int>
     */
    public static function resolveAudienceUserIds(Announcement $announcement): array
    {
        return match ($announcement->audience_type) {
            'batch' => Trainees::where('batch_id', $announcement->audience_batch_id)
                ->whereNotNull('user_id')
                ->pluck('user_id')
                ->all(),
            'role' => User::role($announcement->audience)->pluck('id')->all(),
            'custom' => Trainees::whereIn('id', $announcement->audience_user_ids ?? [])
                ->whereNotNull('user_id')
                ->pluck('user_id')
                ->all(),
            default => Trainees::whereNotNull('user_id')->pluck('user_id')->all(),
        };
    }
}
