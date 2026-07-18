<?php

namespace App\Console\Commands;

use App\Models\Announcement;
use App\Support\AnnouncementDispatcher;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

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

        foreach ($due as $announcement) {
            AnnouncementDispatcher::maybeDispatch($announcement);
        }

        $this->info("Dispatched {$due->count()} scheduled announcement(s).");
    }
}
