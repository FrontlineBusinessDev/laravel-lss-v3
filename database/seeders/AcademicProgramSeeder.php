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
                'name' => 'Accountancy, Business and Management',
                'course_name' => 'ABM',
                'specialization' => 'ABM75',
                'status' => 'active',
            ],
            [
                'name' => 'Bachelor of Electronics Engineering',
                'course_name' => 'BSECE',
                'specialization' => 'IT1',
                'status' => 'active',
            ],
            [
                'name' => 'Bachelor of Science in Accountancy',
                'course_name' => 'BSA',
                'specialization' => 'ACCT1',
                'status' => 'active',
            ],
            [
                'name' => 'Bachelor of Science in Business Administration',
                'course_name' => 'BSBA',
                'specialization' => 'ACCT2',
                'status' => 'active',
            ],
            [
                'name' => 'Bachelor of Science in Computer Engineering',
                'course_name' => 'BSCpE',
                'specialization' => 'IT22',
                'status' => 'active',
            ],
            [
                'name' => 'Bachelor of Science in Computer Science',
                'course_name' => 'BSCS',
                'specialization' => 'IT30',
                'status' => 'active',
            ],
            [
                'name' => 'Bachelor of Science in Industrial Education',
                'course_name' => 'BSIE',
                'specialization' => 'EDUC1',
                'status' => 'active',
            ],
            [
                'name' => 'Bachelor of Science in Information Technology',
                'course_name' => 'BSIT',
                'specialization' => 'IT43',
                'status' => 'active',
            ],
            [
                'name' => 'Bachelor of Science in Psychology',
                'course_name' => 'BSP',
                'specialization' => 'MGMT4',
                'status' => 'active',
            ],
            [
                'name' => 'Humanities and Social Sciences',
                'course_name' => 'HUMSS',
                'specialization' => 'MGMT32',
                'status' => 'active',
            ],
            [
                'name' => 'Information and Communication Technology',
                'course_name' => 'ICT',
                'specialization' => 'ICT123',
                'status' => 'active',
            ],
            [
                'name' => 'Others',
                'course_name' => 'Others',
                'specialization' => 'Others2',
                'status' => 'active',
            ],
            [
                'name' => 'Science, Technology, Engineering, and Math.',
                'course_name' => 'STEM',
                'specialization' => 'ICT88',
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
