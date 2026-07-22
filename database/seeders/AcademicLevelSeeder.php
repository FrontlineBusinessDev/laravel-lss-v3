<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicLevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $data = [
            [
                'name' => 'Continuing Studies',
                'status' => 'active',
                'description' => 'Continuing Studies program level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'First Year',
                'status' => 'active',
                'description' => 'First year college/university level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fourth Year',
                'status' => 'active',
                'description' => 'Fourth year college/university level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Grade 11',
                'status' => 'active',
                'description' => 'Grade 1 primary level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Grade 12',
                'status' => 'active',
                'description' => 'Grade 12 senior high level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Others',
                'status' => 'active',
                'description' => 'Other unclassified.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Second Year',
                'status' => 'active',
                'description' => 'Second year college/university level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Third Year',
                'status' => 'active',
                'description' => 'Third year college/university level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Using updateOrInsert to prevent duplicate errors if run multiple times due to the unique 'name' constraint
        foreach ($data as $record) {
            DB::table('app_settings_academic_level')->updateOrInsert(
                ['name' => $record['name']],
                $record
            );
        }
    }
}
