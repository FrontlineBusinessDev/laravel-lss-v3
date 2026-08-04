<?php

namespace Database\Factories;

use App\Models\AcademicLevel;
use App\Models\AcademicProgram;
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
            // fake()->randomElement() draws from the seeded PHP RNG (DatabaseSeeder
            // seeds it via mt_srand) — unlike inRandomOrder(), which is a DB-level
            // ORDER BY RANDOM() that a PHP seed can't make reproducible.
            'school_id' => fake()->randomElement(PartnerSchools::query()->pluck('id')->all()),
            'academic_program_id' => fake()->randomElement(AcademicProgram::query()->pluck('id')->all()),
            'academic_level_id' => fake()->randomElement(AcademicLevel::query()->pluck('id')->all()),
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
            'date_completed' => fake()->dateTimeBetween('2020-06-01', \Database\Seeders\DatabaseSeeder::SEED_NOW),
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
