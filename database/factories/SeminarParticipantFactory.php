<?php

namespace Database\Factories;

use App\Models\SeminarParticipant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SeminarParticipant>
 */
class SeminarParticipantFactory extends Factory
{
    protected $model = SeminarParticipant::class;

    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'mobile' => fake()->numerify('09#########'),
            'location' => fake()->city(),
            'profession' => fake()->jobTitle(),
            'is_student' => fake()->boolean(30),
            'status' => fake()->randomElement([
                'Pending Payment',
                'Registered',
                'Confirmed',
                'Attended',
                'Completed',
                'Completed',
            ]),
            'registered_at' => fake()->dateTimeBetween('-12 months', 'now'),
        ];
    }
}
