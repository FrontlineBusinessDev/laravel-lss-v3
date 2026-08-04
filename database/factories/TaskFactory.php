<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        $timeGoal = fake()->randomFloat(2, 2, 8);
        $status = fake()->randomElement(['open', 'completed', 'completed', 'completed', 'locked']);

        return [
            // Each seeded task is its own independent assignment, not a
            // fan-out to multiple trainees (see TaskSeeder), so it gets a
            // unique group of one — same invariant the
            // add_task_group_id_to_app_tasks_table migration backfilled for
            // legacy rows. Without this, every factory-created row defaults
            // to a NULL task_group_id and `GROUP BY task_group_id` in
            // TasksController::paginationSearch() collapses ALL of them into
            // one giant row, making "Complete all"/"Lock all" act on every
            // task in the database instead of a single assignment.
            'task_group_id' => (string) Str::uuid(),
            'status' => $status,
            'task' => fake()->sentence(4),
            'description' => fake()->boolean(50) ? fake()->sentence() : null,
            'time_goal' => $timeGoal,
            'time_spent' => $status === 'completed' ? $timeGoal : fake()->randomFloat(2, 0, $timeGoal),
            'date' => fake()->dateTimeBetween('2020-01-01', \Database\Seeders\DatabaseSeeder::SEED_NOW),
            'completed_at' => $status === 'completed' ? fake()->dateTimeBetween('2020-01-01', \Database\Seeders\DatabaseSeeder::SEED_NOW) : null,
        ];
    }
}
