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
                'year_level' => '10',
                'status' => 'active',
                'description' => 'Continuing Studies program level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'First Year',
                'year_level' => '4',
                'status' => 'active',
                'description' => 'First year college/university level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Fourth Year',
                'year_level' => '66', // Adjusted based on your raw input "Fourth Year66"
                'status' => 'active',
                'description' => 'Fourth year college/university level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Grade 1',
                'year_level' => '10', // Adjusted based on your raw input "Grade 110"
                'status' => 'active',
                'description' => 'Grade 1 primary level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Grade 12',
                'year_level' => '318', // Adjusted based on your raw input "Grade 12318"
                'status' => 'active',
                'description' => 'Grade 12 senior high level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Others',
                'year_level' => '2',
                'status' => 'active',
                'description' => 'Other unclassified academic levels.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Second Year',
                'year_level' => '8',
                'status' => 'active',
                'description' => 'Second year college/university level.',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Third Year',
                'year_level' => '16',
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
