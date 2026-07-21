<?php

namespace Database\Factories;

use App\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

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
            'status' => $status,
            'task' => fake()->sentence(4),
            'description' => fake()->boolean(50) ? fake()->sentence() : null,
            'time_goal' => $timeGoal,
            'time_spent' => $status === 'completed' ? $timeGoal : fake()->randomFloat(2, 0, $timeGoal),
            'date' => fake()->dateTimeBetween('2020-01-01', 'now'),
            'completed_at' => $status === 'completed' ? fake()->dateTimeBetween('2020-01-01', 'now') : null,
        ];
    }
}
