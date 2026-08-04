<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Fixed "now" for every `fake()->dateTimeBetween($x, 'now')` call in the
     * seeders/factories below. The literal string 'now' resolves via PHP's
     * strtotime('now') — real wall-clock time, NOT affected by mt_srand() or
     * Carbon::setTestNow() — so leaving it in place would keep shifting the
     * random date range's upper bound on every run and silently defeat the
     * PRNG seeding below. Referenced as \Database\Seeders\DatabaseSeeder::SEED_NOW.
     */
    public const SEED_NOW = '2026-08-04 00:00:00';

    /**
     * Seed the application's database.
     *
     * IMPORTANT: RoleSeeder MUST run before UserSeeder — UserSeeder calls
     * syncRoles() and the roles must already exist.
     *
     * Fixed PRNG seed so every fake()/mt_rand()/Collection::random() call
     * made by the seeders below (directly or via factories) draws from the
     * same stream on every run — two consecutive `migrate:fresh --seed` runs
     * then produce byte-identical data instead of different data each time.
     * Does NOT cover inRandomOrder() (DB-level, not PHP RNG) — those call
     * sites were swapped to a stable orderBy('id') instead.
     */
    public function run(): void
    {
        mt_srand(42);

        $this->call([
            RoleSeeder::class,
            UserSeeder::class,
            PartnerSchoolsSeeder::class,
            AcademicIndustrySeeder::class,
            AcademicLevelSeeder::class,
            AcademicProgramSeeder::class,
            AcademicProgramTypeSeeder::class,
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
