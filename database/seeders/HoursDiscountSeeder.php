<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HoursDiscountSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            ['min_hours' => 120.00, 'discount_percentage' => 2.00],
            ['min_hours' => 300.00, 'discount_percentage' => 5.00],
            ['min_hours' => 500.00, 'discount_percentage' => 8.00],
        ];

        foreach ($tiers as $tier) {
            DB::table('app_settings_hours_discounts')->updateOrInsert(
                ['min_hours' => $tier['min_hours']],
                [...$tier, 'created_at' => now(), 'updated_at' => now()],
            );
        }
    }
}
