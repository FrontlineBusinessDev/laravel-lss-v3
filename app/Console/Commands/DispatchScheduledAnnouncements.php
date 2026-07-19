<?php

namespace App\Console\Commands;

use App\Models\Announcement;
use App\Support\AnnouncementDispatcher;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

#[Signature('announcements:dispatch-scheduled')]
#[Description('Dispatch notifications for announcements whose scheduled_at has passed but were not yet notified.')]
class DispatchScheduledAnnouncements extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $due = Announcement::query()
            ->whereNull('notified_at')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->get();

        $dispatched = 0;

        foreach ($due as $announcement) {
            try {
                AnnouncementDispatcher::maybeDispatch($announcement);
                $dispatched++;
            } catch (Throwable $e) {
                Log::error('Scheduled announcement dispatch failed', [
                    'announcement_id' => $announcement->id,
                    'message' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
            }
        }

        $this->info("Dispatched {$dispatched} of {$due->count()} scheduled announcement(s).");
    }
}
