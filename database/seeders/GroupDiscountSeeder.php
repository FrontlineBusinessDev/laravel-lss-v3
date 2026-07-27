<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GroupDiscountSeeder extends Seeder
{
    public function run(): void
    {
        $tiers = [
            ['min_trainees' => 1, 'discount_percentage' => 0.00],
            ['min_trainees' => 5, 'discount_percentage' => 3.00],
            ['min_trainees' => 10, 'discount_percentage' => 5.00],
            ['min_trainees' => 20, 'discount_percentage' => 8.00],
        ];

        foreach ($tiers as $tier) {
            DB::table('app_settings_group_discounts')->updateOrInsert(
                ['min_trainees' => $tier['min_trainees']],
                [...$tier, 'created_at' => now(), 'updated_at' => now()],
            );
        }
    }
}
