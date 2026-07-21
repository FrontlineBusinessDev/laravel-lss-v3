<?php

namespace Database\Factories;

use App\Models\PartnerSchools;
use App\Models\Trainees;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Trainees>
 */
class TraineesFactory extends Factory
{
    protected $model = Trainees::class;

    public function definition(): array
    {
        return [
            'status' => 'active',
            'school_id' => PartnerSchools::query()->inRandomOrder()->value('id'),
            'public_url_id' => Str::ulid()->toBase32(),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'birthday' => fake()->dateTimeBetween('-24 years', '-18 years'),
            'birth_place' => fake()->city(),
            'gender' => fake()->randomElement(['male', 'female']),
            'mobile_number' => fake()->numerify('09#########'),
            'emergency_contact_name' => fake()->name(),
            'emergency_contact_number' => fake()->numerify('09#########'),
            'required_hours' => fake()->randomElement([120.00, 300.00, 500.00]),
            'address' => fake()->address(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn() => [
            'status' => 'completed',
            'date_completed' => fake()->dateTimeBetween('-6 months', 'now'),
        ]);
    }

    public function terminated(): static
    {
        return $this->state([
            'status' => 'terminated',
            'termination_remarks' => fake()->sentence(),
        ]);
    }
}
