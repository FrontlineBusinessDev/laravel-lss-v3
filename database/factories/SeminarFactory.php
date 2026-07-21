<?php

namespace Database\Factories;

use App\Models\Seminar;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Seminar>
 */
class SeminarFactory extends Factory
{
    protected $model = Seminar::class;

    public function definition(): array
    {
        return [
            'topic' => fake()->sentence(3),
            'description' => fake()->paragraph(),
            'date' => fake()->dateTimeBetween('2020-01-01', '+3 months'),
            'venue' => fake()->city() . ' Convention Center',
            'fee' => fake()->randomElement([500.00, 800.00, 1200.00, 1500.00]),
            'max_participants' => fake()->numberBetween(30, 150),
            'status' => fake()->randomElement(['active', 'completed', 'completed', 'closed']),
            'type' => fake()->randomElement(['Webinar', 'On-site', 'Hybrid']),
        ];
    }
}
