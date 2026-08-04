<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskRating;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * One rating per distinct (batch, task name, trainee) — mirrors real Task
 * rows rather than random combinations, so app_task_ratings_unique_current
 * is never violated.
 */
class TaskRatingSeeder extends Seeder
{
    public function run(): void
    {
        $evaluatorIds = User::role(['trainer', 'admin', 'developer'])->pluck('id');
        if ($evaluatorIds->isEmpty()) {
            $evaluatorIds = User::query()->pluck('id');
        }

        Task::query()
            ->whereNotNull('trainee_id')
            ->whereNotNull('batch_id')
            ->orderBy('id')
            ->limit(400)
            ->get(['batch_id', 'trainee_id', 'task'])
            ->unique(fn(Task $task) => "{$task->batch_id}-{$task->trainee_id}-{$task->task}")
            ->each(function (Task $task) use ($evaluatorIds) {
                TaskRating::factory()->create([
                    'batch_id' => $task->batch_id,
                    'trainee_id' => $task->trainee_id,
                    'task_name' => $task->task,
                    // fake()->randomElement() (not Collection::random(), which uses
                    // PHP's CSPRNG Randomizer and ignores DatabaseSeeder's mt_srand)
                    // so this pick stays reproducible across seed runs.
                    'evaluator_id' => fake()->randomElement($evaluatorIds->all()),
                ]);
            });
    }
}
