<?php

namespace Database\Factories;

use App\Models\TaskRating;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TaskRating>
 */
class TaskRatingFactory extends Factory
{
    protected $model = TaskRating::class;

    public function definition(): array
    {
        return [
            'rating' => fake()->numberBetween(1, 5),
            'hours_spent' => fake()->randomFloat(2, 1, 8),
            'comments' => fake()->boolean(40) ? fake()->sentence() : null,
            'rated_at' => fake()->dateTimeBetween('2020-01-01', 'now'),
        ];
    }
}
