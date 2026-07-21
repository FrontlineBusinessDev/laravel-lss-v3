<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RateSeeder extends Seeder
{
    public function run(): void
    {
        $rates = [
            ['setup' => 'f2f', 'rate_per_hour' => 65.00],
            ['setup' => 'online', 'rate_per_hour' => 55.00],
        ];

        foreach ($rates as $rate) {
            DB::table('app_settings_rates')->updateOrInsert(
                ['setup' => $rate['setup']],
                [...$rate, 'created_at' => now(), 'updated_at' => now()],
            );
        }
    }
}
