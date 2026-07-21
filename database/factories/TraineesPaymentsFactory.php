<?php

namespace Database\Factories;

use App\Models\TraineesPayments;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TraineesPayments>
 */
class TraineesPaymentsFactory extends Factory
{
    protected $model = TraineesPayments::class;

    public function definition(): array
    {
        return [
            'amount_paid' => fake()->randomFloat(2, 500, 5000),
            'payment_date' => fake()->dateTimeBetween('-12 months', 'now'),
            'reference_no' => fake()->bothify('REF-#####??'),
            'notes' => fake()->boolean(30) ? fake()->sentence() : null,
        ];
    }
}
