<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AcademicLearningOutcomesSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed a default Academic Industry to satisfy the foreign key constraint
        $industryId = DB::table('app_settings_academic_industry')->insertGetId([
            'status' => 'active',
            'name' => 'General Academic Industry',
            'description' => 'Default industry track for learning outcomes.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Seed Academic Programs and keep track of their IDs
        $programs = [
            'ABM'  => ['name' => 'Accountancy, Business, and Management (ABM)', 'course_name' => 'Business Administration'],
            'ACCT' => ['name' => 'Accounting (ACCT)', 'course_name' => 'Bachelor of Science in Accountancy'],
            'ICT'  => ['name' => 'Information and Communications Technology (ICT)', 'course_name' => 'ICT Tech Vocational'],
            'IT'   => ['name' => 'Information Technology (IT)', 'course_name' => 'Bachelor of Science in Information Technology'],
            'MGMT' => ['name' => 'Management (MGMT)', 'course_name' => 'Business Management'],
            'STEM' => ['name' => 'Science, Technology, Engineering, and Mathematics (STEM)', 'course_name' => 'General STEM'],
        ];

        $programIds = [];
        foreach ($programs as $code => $info) {
            $programIds[$code] = DB::table('app_settings_academic_program')->insertGetId([
                'status' => 'active',
                'name' => $info['name'],
                'course_name' => $info['course_name'],
                'specialization' => $code,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 3. Raw dataset parsed from your list
        $rawOutcomes = [
            // ABM
            ['text' => 'Basic Bookkeeping', 'prog' => 'ABM', 'status' => 'active'],
            ['text' => 'Understand and Apply the Advanced Functions of MS Excel', 'prog' => 'ABM', 'status' => 'active'],
            ['text' => 'Understand the Basic Functions and Features of QuickBooks Online', 'prog' => 'ABM', 'status' => 'active'],
            ['text' => 'Understand the Components of a Payroll and Prepare a Payroll Report (Philippine Payroll)', 'prog' => 'ABM', 'status' => 'active'],

            // ACCT
            ['text' => 'Basic Bookkeeping', 'prog' => 'ACCT', 'status' => 'active'], // Note: Handled duplicate checking below if needed, but strings differ by context
            ['text' => 'Budget control and monitoring process.', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Create and Fill-out Accounting Source Documents', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Create Financial Projection Report', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Filing Common Philippine Business Tax Forms', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Filing of Various US Tax return Forms', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Prepare a Non-Profit Financial Statements', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Understand and Apply the Advanced Functions of MS Excel', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Understand the Basic Components of US Payroll', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Understand the Basic Functions and Features of QuickBooks Online', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Understand the Basic Functions and Features of Xero Accounting Software', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Understand the Business Registration Processes (Sole Proprietorship, Partnership, Corporation)', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Understand the Components and Importance of Income Tax Return (Philippine Taxation)', 'prog' => 'ACCT', 'status' => 'active'],
            ['text' => 'Understand the Components of a Payroll and Prepare a Payroll Report (Philippine Payroll)', 'prog' => 'ACCT', 'status' => 'active'],

            // ICT
            ['text' => 'Apply basic scripting language using JavaScript', 'prog' => 'ICT', 'status' => 'active'],
            ['text' => 'Convert Mockup Design into an Actual Web pages (HTML / CSS)', 'prog' => 'ICT', 'status' => 'active'],
            ['text' => 'Design Website Mockup and UI using Figma', 'prog' => 'ICT', 'status' => 'active'],
            ['text' => 'Develop Responsive Web Design', 'prog' => 'ICT', 'status' => 'active'],

            // IT
            ['text' => 'Apply basic scripting language using JavaScript.', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Apply SASS technology in Website Conversion.', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Build website layouts fast and efficiently using Tailwind CSS utility classes.', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Convert Mockup Design into an Actual Web pages (HTML / CSS).', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Convert static website to WordPress website.', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Create and manage models, controllers, and routes to implement CRUD functionality in Laravel applications.', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Design and implement databases using migrations and seeders.', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Design Website Mockup and UI using Figma.', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Develop Responsive Web Design.', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'MySQL, CRUD, CORS, and API', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Props, State and Store Context', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'ReactJS Frontend', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'ReactJS Project Development', 'prog' => 'IT', 'status' => 'active'],
            ['text' => 'Understand Laravel architecture and manage projects using Composer and Artisan.', 'prog' => 'IT', 'status' => 'active'],

            // MGMT
            ['text' => 'Apply basic payroll processing.', 'prog' => 'MGMT', 'status' => 'active'],
            ['text' => 'Apply data management, analysis, and reporting using MS Excel advanced formulas and functions.', 'prog' => 'MGMT', 'status' => 'active'],
            ['text' => 'Conduct job interviews to applicants.', 'prog' => 'MGMT', 'status' => 'active'],
            ['text' => 'Create company memorandums and notices for different work positions and hierarchies.', 'prog' => 'MGMT', 'status' => 'active'],
            ['text' => 'Practice business communication etiquette and email correspondence.', 'prog' => 'MGMT', 'status' => 'active'],
            ['text' => 'Understand the Department of Labor and Employment standards and policies.', 'prog' => 'MGMT', 'status' => 'active'],
            ['text' => 'Understand the industry standards in human resource policies and procedures', 'prog' => 'MGMT', 'status' => 'active'],

            // STEM
            ['text' => 'Apply basic scripting language using JavaScript', 'prog' => 'STEM', 'status' => 'active'],
            ['text' => 'Convert Mockup Design into an Actual Web pages (HTML / CSS)', 'prog' => 'STEM', 'status' => 'active'],
            ['text' => 'Design Website Mockup and UI using Figma', 'prog' => 'STEM', 'status' => 'active'],
            ['text' => 'Develop Responsive Web Design', 'prog' => 'STEM', 'status' => 'active'],

            // Inactive Records (ACCT & MGMT)
            ['text' => 'Compute the Withholding Taxes on Compensation', 'prog' => 'ACCT', 'status' => 'inactive'],
            ['text' => 'Create Accounting Reports through Data Visualization', 'prog' => 'ACCT', 'status' => 'inactive'],
            ['text' => 'Create an Automated Accounting System Using MS Excel', 'prog' => 'ACCT', 'status' => 'inactive'],
            ['text' => 'Create an Automated Pay Slip', 'prog' => 'ACCT', 'status' => 'inactive'],
            ['text' => 'Create an Inventory and Accounting System Using MS Excel', 'prog' => 'ACCT', 'status' => 'inactive'],
            ['text' => 'Understand the Components of Philippine Payroll', 'prog' => 'ACCT', 'status' => 'inactive'],
            ['text' => 'Understand the Different Employee Benefits', 'prog' => 'ACCT', 'status' => 'inactive'],
            ['text' => 'Understand the Federal Tax Returns', 'prog' => 'ACCT', 'status' => 'inactive'],
            ['text' => 'Understand the use of eFPS and eBIRForms', 'prog' => 'ACCT', 'status' => 'inactive'],
            ['text' => 'Essentials of Job Interview', 'prog' => 'MGMT', 'status' => 'inactive'],
            ['text' => 'Filing and Documentation', 'prog' => 'MGMT', 'status' => 'inactive'],
            ['text' => 'Job Interview Process', 'prog' => 'MGMT', 'status' => 'inactive'],
            ['text' => 'Preparing for a job application interview', 'prog' => 'MGMT', 'status' => 'inactive'],
        ];

        // 4. Insert outcomes while preventing unique constraint violations on 'learning_outcomes'
        $insertedOutcomes = [];
        $finalInserts = [];

        foreach ($rawOutcomes as $outcome) {
            // Your schema enforces a UNIQUE constraint on the 'learning_outcomes' column.
            // If identical outcome text appears across different programs, we append the program code to ensure uniqueness.
            $text = $outcome['text'];
            if (in_array($text, $insertedOutcomes)) {
                $text .= ' (' . $outcome['prog'] . ')';
            }
            $insertedOutcomes[] = $text;

            $finalInserts[] = [
                'status' => $outcome['status'],
                'learning_outcomes' => $text,
                'academic_industry_id' => $industryId,
                'academic_program_id' => $programIds[$outcome['prog']],
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('app_settings_academic_learning_outcomes')->insert($finalInserts);
    }
}
