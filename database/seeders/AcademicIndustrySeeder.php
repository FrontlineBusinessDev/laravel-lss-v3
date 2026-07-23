<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicIndustrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $records = [
            [
                'name' => 'Information Technology',
                'description' => 'Information Technology sector.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Accounting',
                'description' => 'Accounting academic or industry sector.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Using updateOrInsert to prevent duplicate errors if run multiple times
        foreach ($records as $record) {
            DB::table('app_settings_academic_industry')->updateOrInsert(
                ['name' => $record['name']], // Unique identifier to check
                $record
            );
        }
    }
}
