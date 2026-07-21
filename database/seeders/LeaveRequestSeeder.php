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
            ->inRandomOrder()
            ->limit(80)
            ->get()
            ->each(function (Trainees $trainee) use ($categoryIds) {
                $count = fake()->numberBetween(1, 2);

                for ($i = 0; $i < $count; $i++) {
                    LeaveRequest::factory()
                        ->for($trainee, 'trainee')
                        ->create([
                            'batch_id' => $trainee->batch_id,
                            'leave_category_id' => $categoryIds->random(),
                        ]);
                }
            });
    }
}
