<?php

namespace Database\Seeders;

use App\Models\Batches;
use Illuminate\Database\Seeder;

class BatchSeeder extends Seeder
{
    public function run(): void
    {
        Batches::factory()->count(18)->create();
        Batches::factory()->terminated()->count(4)->create();
    }
}
