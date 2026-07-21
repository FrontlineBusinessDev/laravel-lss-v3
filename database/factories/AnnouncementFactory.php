<?php

namespace Database\Factories;

use App\Models\Announcement;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Announcement>
 */
class AnnouncementFactory extends Factory
{
    protected $model = Announcement::class;

    public function definition(): array
    {
        $postedAt = fake()->dateTimeBetween('2020-01-01', 'now');

        return [
            'status' => 'active',
            'subject' => fake()->sentence(6),
            'description' => fake()->paragraph(),
            'audience_type' => fake()->randomElement(['all', 'all', 'role']),
            'audience' => fake()->randomElement(['trainer', 'trainee']),
            'scheduled_at' => $postedAt,
            'notified_at' => $postedAt,
        ];
    }
}
