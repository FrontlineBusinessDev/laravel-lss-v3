<?php

use App\Models\AcademicIndustry;
use App\Models\AcademicLevel;
use App\Models\AcademicProgram;
use App\Models\AcademicProgramType;
use App\Models\Batches;
use App\Models\PartnerSchools;
use App\Models\Trainees;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind different classes or traits.
|
*/

pest()->extend(TestCase::class)
    ->use(RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

/**
 * Creates (or reuses) a user seeded with the given role. Shared by every
 * role/permission test across the suite — relies on the caller having
 * already run `$this->seed(RoleSeeder::class)`.
 */
function userWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

/**
 * Trainees::factory() pulls school/program/level ids from whatever already
 * exists in the DB (`fake()->randomElement(Model::query()->pluck('id')->all())`),
 * which throws on an empty array. This helper firstOrCreates one row of each
 * academic prerequisite so any test can create a Trainee without repeating
 * that setup. A batch is always attached too — TraineeObserver::saving()
 * runs BillingService::calculateBilling() on every save, which dereferences
 * $trainee->batch->setup and fatals on a null batch.
 */
function makeTrainee(array $overrides = []): Trainees
{
    if (! PartnerSchools::query()->exists()) {
        PartnerSchools::create([
            'status' => 'active',
            'school_name' => 'Test Partner School',
            'abbreviation' => 'TPS',
        ]);
    }
    if (! AcademicProgram::query()->exists()) {
        AcademicProgram::create([
            'status' => 'active',
            'name' => 'Test Program',
            'abbreviation' => 'TP',
        ]);
    }
    if (! AcademicLevel::query()->exists()) {
        AcademicLevel::create([
            'status' => 'active',
            'name' => 'Test Level',
        ]);
    }

    return Trainees::factory()->create([
        'batch_id' => $overrides['batch_id'] ?? makeBatch()->id,
        ...$overrides,
    ]);
}

/**
 * Batches::factory() similarly needs an existing AcademicIndustry and
 * AcademicProgramType row to draw an id from.
 */
function makeBatch(array $overrides = []): Batches
{
    if (! AcademicIndustry::query()->exists()) {
        AcademicIndustry::create([
            'status' => 'active',
            'name' => 'Test Industry',
        ]);
    }
    if (! AcademicProgramType::query()->exists()) {
        AcademicProgramType::create([
            'status' => 'active',
            'name' => 'Test Program Type',
        ]);
    }

    return Batches::factory()->create($overrides);
}
