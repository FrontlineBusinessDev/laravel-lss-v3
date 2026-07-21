<?php

namespace Database\Factories;

use App\Models\LeaveRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveRequest>
 */
class LeaveRequestFactory extends Factory
{
    protected $model = LeaveRequest::class;

    public function definition(): array
    {
        $leaveDate = fake()->dateTimeBetween('2020-01-01', 'now');
        $returnDate = (clone $leaveDate)->modify('+' . fake()->numberBetween(1, 5) . ' days');

        return [
            'status' => fake()->randomElement(['approved', 'approved', 'approved', 'pending', 'declined']),
            'leave_date' => $leaveDate,
            'return_date' => $returnDate,
            'reason' => fake()->sentence(10),
            'decision_remarks' => fake()->boolean(40) ? fake()->sentence() : null,
        ];
    }
}
