<?php

namespace Database\Seeders;

use App\Models\Announcement;
use App\Models\User;
use Illuminate\Database\Seeder;

class AnnouncementSeeder extends Seeder
{
    public function run(): void
    {
        $authorIds = User::role(['admin', 'developer'])->pluck('id');
        if ($authorIds->isEmpty()) {
            $authorIds = User::query()->pluck('id');
        }

        Announcement::factory()
            ->count(15)
            ->create()
            ->each(function (Announcement $announcement) use ($authorIds) {
                $announcement->created_by_id = $authorIds->random();
                $announcement->save();
            });
    }
}
