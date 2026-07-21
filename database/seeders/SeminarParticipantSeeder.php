<?php

namespace Database\Seeders;

use App\Models\Seminar;
use App\Models\SeminarParticipant;
use Illuminate\Database\Seeder;

class SeminarParticipantSeeder extends Seeder
{
    public function run(): void
    {
        Seminar::query()->each(function (Seminar $seminar) {
            SeminarParticipant::factory()
                ->count(fake()->numberBetween(10, 40))
                ->for($seminar, 'seminar')
                ->create();
        });
    }
}
