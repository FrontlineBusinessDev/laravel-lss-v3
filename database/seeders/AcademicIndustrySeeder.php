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
                'name' => 'Accounting (ACCT)',
                'description' => 'Accounting academic or industry sector.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Accounting, Business, and Management (ABM)',
                'description' => 'Accounting, Business, and Management strand/sector.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Administration and Management (MGMT)',
                'description' => 'Administration and Management sector.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Education (EDUC)',
                'description' => 'Education academic sector.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Information and Communication Technologies (ICT)',
                'description' => 'Information and Communication Technologies sector.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Information Technology (IT)',
                'description' => 'Information Technology sector.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Others',
                'description' => 'Other unclassified academic or industry sectors.',
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Science, Technology, Engineering, and Mathematics (STEM)',
                'description' => 'Science, Technology, Engineering, and Mathematics strand/sector.',
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
