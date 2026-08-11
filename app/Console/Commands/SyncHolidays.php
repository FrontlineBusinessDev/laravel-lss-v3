<?php

namespace App\Console\Commands;

use App\Support\HolidaySync;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

#[Signature('holidays:sync')]
#[Description('Sync public holidays for the current and next year from the Nager.Date API into app_holidays.')]
class SyncHolidays extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $currentYear = Carbon::now()->year;

        $totalSynced = 0;
        foreach ([$currentYear, $currentYear + 1] as $year) {
            $totalSynced += HolidaySync::syncYear($year);
        }

        $this->info("Synced {$totalSynced} holiday(s) for {$currentYear} and " . ($currentYear + 1) . '.');
    }
}
