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
                // fake()->randomElement() (not Collection::random(), which uses
                // PHP's CSPRNG Randomizer and ignores DatabaseSeeder's mt_srand)
                // so this pick stays reproducible across seed runs.
                $announcement->created_by_id = fake()->randomElement($authorIds->all());
                $announcement->save();
            });
    }
}
