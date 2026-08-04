<?php

namespace Database\Seeders;

use App\Models\LeaveCategory;
use App\Models\LeaveRequest;
use App\Models\Trainees;
use Illuminate\Database\Seeder;

class LeaveRequestSeeder extends Seeder
{
    public function run(): void
    {
        $categoryIds = LeaveCategory::query()->pluck('id');
        if ($categoryIds->isEmpty()) {
            return;
        }

        Trainees::query()
            ->orderBy('id')
            ->limit(80)
            ->get()
            ->each(function (Trainees $trainee) use ($categoryIds) {
                $count = fake()->numberBetween(1, 2);

                for ($i = 0; $i < $count; $i++) {
                    LeaveRequest::factory()
                        ->for($trainee, 'trainee')
                        ->create([
                            'batch_id' => $trainee->batch_id,
                            // fake()->randomElement() (not Collection::random(), which
                            // uses PHP's CSPRNG Randomizer and ignores DatabaseSeeder's
                            // mt_srand) so this pick stays reproducible across seed runs.
                            'leave_category_id' => fake()->randomElement($categoryIds->all()),
                        ]);
                }
            });
    }
}
