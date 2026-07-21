<?php

namespace Database\Seeders;

use App\Models\Seminar;
use Illuminate\Database\Seeder;

class SeminarSeeder extends Seeder
{
    public function run(): void
    {
        Seminar::factory()->count(8)->create();
    }
}
