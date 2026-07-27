<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\Trainees;
use App\Models\User;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run(): void
    {
        $trainerIds = User::role('trainer')->pluck('id');
        if ($trainerIds->isEmpty()) {
            return;
        }

        Trainees::query()->with('batch')->each(function (Trainees $trainee) use ($trainerIds) {
            $count = fake()->numberBetween(3, 10);

            Task::factory()
                ->count($count)
                ->for($trainee, 'trainee')
                ->for($trainee->batch, 'batch')
                ->create(['trainer_id' => fn() => $trainerIds->random()]);
        });
    }
}
