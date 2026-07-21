<?php

namespace Database\Factories;

use App\Models\AcademicIndustry;
use App\Models\AcademicLevel;
use App\Models\AcademicProgram;
use App\Models\Batches;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Batches>
 */
class BatchesFactory extends Factory
{
    protected $model = Batches::class;

    public function definition(): array
    {
        $dateStarted = fake()->dateTimeBetween('-18 months', 'now');

        return [
            'status' => 'active',
            'batch_code' => 'FBS-' . fake()->unique()->numberBetween(1000, 9999),
            'public_registration_url_id' => Str::ulid()->toBase32(),
            'is_public_url_enable' => fake()->boolean(70),
            'date_started' => $dateStarted,
            'projected_end_date' => (clone $dateStarted)->modify('+' . fake()->numberBetween(4, 12) . ' weeks'),
            'setup' => fake()->randomElement(['f2f', 'online']),
            'academic_industry_id' => AcademicIndustry::query()->inRandomOrder()->value('id'),
            'academic_level_id' => AcademicLevel::query()->inRandomOrder()->value('id'),
            'academic_program_id' => AcademicProgram::query()->inRandomOrder()->value('id'),
        ];
    }

    public function terminated(): static
    {
        return $this->state(['status' => 'terminated']);
    }
}
