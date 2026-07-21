<?php

namespace Database\Factories;

use App\Models\BehavioralEvaluation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BehavioralEvaluation>
 */
class BehavioralEvaluationFactory extends Factory
{
    protected $model = BehavioralEvaluation::class;

    public function definition(): array
    {
        return [
            'remarks' => fake()->boolean(30) ? fake()->sentence() : null,
            'created_at' => fake()->dateTimeBetween('2020-01-01', 'now'),
        ];
    }
}
