<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            [
                'name' => 'College On-the-Job Training',
                'status' => 'active',
            ],
            [
                'name' => 'Continuing Studies',
                'status' => 'active',
            ],
            [
                'name' => 'Senior High School Work Immersion',
                'status' => 'active',
            ],
            [
                'name' => 'Upskill Training',
                'status' => 'active',
            ],
        ];

        foreach ($programs as $program) {
            DB::table('app_settings_academic_program')->updateOrInsert(
                ['name' => $program['name']], // Unique identifier to prevent duplicates if run twice
                [
                    'course_name' => $program['course_name'],
                    'specialization' => $program['specialization'],
                    'status' => strtolower($program['status']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
