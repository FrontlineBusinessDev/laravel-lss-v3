<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * IMPORTANT: RoleSeeder MUST run before UserSeeder — UserSeeder calls
     * syncRoles() and the roles must already exist.
     */
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            PartnerSchoolsSeeder::class,
            AcademicIndustrySeeder::class,
            AcademicLevelSeeder::class,
            AcademicProgramSeeder::class,
            AcademicLearningOutcomesSeeder::class,
            RateSeeder::class,
            HoursDiscountSeeder::class,
            GroupDiscountSeeder::class,
            BatchSeeder::class,
            TraineeSeeder::class,
            TraineePaymentSeeder::class,
            TaskSeeder::class,
            TaskRatingSeeder::class,
            SeminarSeeder::class,
            SeminarParticipantSeeder::class,
            AnnouncementSeeder::class,
            LeaveCategorySeeder::class,
            LeaveRequestSeeder::class,
            BehavioralQuestionSeeder::class,
            BehavioralEvaluationSeeder::class,
            CertificateCitationSeeder::class,
            CertificateTemplateSeeder::class,
            CertificateSeeder::class,
        ]);
    }
}
