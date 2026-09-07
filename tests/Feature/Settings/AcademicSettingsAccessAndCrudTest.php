<?php

use App\Models\AcademicIndustry;
use App\Models\AcademicLearningOutcomes;
use App\Models\AcademicLevel;
use App\Models\AcademicProgram;
use App\Models\AcademicProgramType;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Access control ───────────────────────────────────────────────────────────

$academicRoutes = [
    'industry' => 'settings.academic.industry.pagination-search',
    'learning-outcomes' => 'settings.academic.learning-outcomes.pagination-search',
    'level' => 'settings.academic.level.pagination-search',
    'program' => 'settings.academic.program.pagination-search',
    'program-type' => 'settings.academic.program-type.pagination-search',
];

test('developer can list every academic sub-module', function () use ($academicRoutes) {
    $developer = userWithRole('developer');

    foreach ($academicRoutes as $routeName) {
        $this->actingAs($developer)
            ->getJson(route($routeName))
            ->assertOk()
            ->assertJsonStructure(['data' => ['data', 'meta']]);
    }
});

test('admin can list every academic sub-module', function () use ($academicRoutes) {
    $admin = userWithRole('admin');

    foreach ($academicRoutes as $routeName) {
        $this->actingAs($admin)
            ->getJson(route($routeName))
            ->assertOk();
    }
});

test('trainer cannot list any academic sub-module', function () use ($academicRoutes) {
    $trainer = userWithRole('trainer');

    foreach ($academicRoutes as $routeName) {
        $this->actingAs($trainer)
            ->getJson(route($routeName))
            ->assertForbidden();
    }
});

test('trainee cannot list any academic sub-module', function () use ($academicRoutes) {
    $trainee = userWithRole('trainee');

    foreach ($academicRoutes as $routeName) {
        $this->actingAs($trainee)
            ->getJson(route($routeName))
            ->assertForbidden();
    }
});

// ── Industry CRUD ─────────────────────────────────────────────────────────────

test('an academic industry can be created', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.industry.store'), [
            'status' => 'active',
            'name' => 'Hospitality',
            'description' => 'Hospitality industry track',
        ])
        ->assertCreated();

    $industry = AcademicIndustry::where('name', 'Hospitality')->sole();

    expect($industry->description)->toBe('Hospitality industry track')
        ->and($industry->status)->toBe('active');
});

test('creating an academic industry without a name fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.industry.store'), [
            'status' => 'active',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

test('an academic industry can be archived then restored', function () {
    $developer = userWithRole('developer');
    $industry = AcademicIndustry::create(['status' => 'active', 'name' => 'Maritime']);

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.industry.archive', $industry->id))
        ->assertOk();

    expect($industry->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.industry.restore', $industry->id))
        ->assertOk();

    expect($industry->fresh()->status)->toBe('active');
});

// ── Learning outcomes CRUD ────────────────────────────────────────────────────

test('a learning outcome can be created', function () {
    $industry = AcademicIndustry::create(['status' => 'active', 'name' => 'BPO']);

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.learning-outcomes.store'), [
            'status' => 'active',
            'learning_outcomes' => 'Handle inbound customer calls',
            'academic_industry_id' => $industry->id,
        ])
        ->assertCreated();

    $outcome = AcademicLearningOutcomes::where('learning_outcomes', 'Handle inbound customer calls')->sole();

    expect($outcome->academic_industry_id)->toBe($industry->id);
});

test('creating a learning outcome without an industry fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.learning-outcomes.store'), [
            'status' => 'active',
            'learning_outcomes' => 'Handle inbound customer calls',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('academic_industry_id');
});

test('a learning outcome can be archived then restored', function () {
    $developer = userWithRole('developer');
    $industry = AcademicIndustry::create(['status' => 'active', 'name' => 'Healthcare']);
    $outcome = AcademicLearningOutcomes::create([
        'status' => 'active',
        'learning_outcomes' => 'Administer basic first aid',
        'academic_industry_id' => $industry->id,
    ]);

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.learning-outcomes.archive', $outcome->id))
        ->assertOk();

    expect($outcome->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.learning-outcomes.restore', $outcome->id))
        ->assertOk();

    expect($outcome->fresh()->status)->toBe('active');
});

// ── Level CRUD ────────────────────────────────────────────────────────────────

test('an academic level can be created', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.level.store'), [
            'status' => 'active',
            'name' => 'Beginner',
            'description' => 'Entry level track',
        ])
        ->assertCreated();

    $level = AcademicLevel::where('name', 'Beginner')->sole();

    expect($level->description)->toBe('Entry level track');
});

test('creating an academic level without a name fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.level.store'), [
            'status' => 'active',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

test('an academic level can be archived then restored', function () {
    $developer = userWithRole('developer');
    $level = AcademicLevel::create(['status' => 'active', 'name' => 'Advanced']);

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.level.archive', $level->id))
        ->assertOk();

    expect($level->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.level.restore', $level->id))
        ->assertOk();

    expect($level->fresh()->status)->toBe('active');
});

// ── Program CRUD ──────────────────────────────────────────────────────────────

test('an academic program can be created', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.program.store'), [
            'status' => 'active',
            'name' => 'Culinary Arts',
            'abbreviation' => 'CA',
        ])
        ->assertCreated();

    $program = AcademicProgram::where('name', 'Culinary Arts')->sole();

    expect($program->abbreviation)->toBe('CA');
});

test('creating an academic program without a name fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.program.store'), [
            'status' => 'active',
            'abbreviation' => 'CA',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

test('an academic program can be archived then restored', function () {
    $developer = userWithRole('developer');
    $program = AcademicProgram::create(['status' => 'active', 'name' => 'Baking', 'abbreviation' => 'BK']);

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.program.archive', $program->id))
        ->assertOk();

    expect($program->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.program.restore', $program->id))
        ->assertOk();

    expect($program->fresh()->status)->toBe('active');
});

// ── Program-type CRUD ─────────────────────────────────────────────────────────

test('an academic program type can be created', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.program-type.store'), [
            'status' => 'active',
            'name' => 'Certificate',
        ])
        ->assertCreated();

    expect(AcademicProgramType::where('name', 'Certificate')->exists())->toBeTrue();
});

test('creating an academic program type without a name fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.academic.program-type.store'), [
            'status' => 'active',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

test('an academic program type can be archived then restored', function () {
    $developer = userWithRole('developer');
    $programType = AcademicProgramType::create(['status' => 'active', 'name' => 'Diploma']);

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.program-type.archive', $programType->id))
        ->assertOk();

    expect($programType->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('settings.academic.program-type.restore', $programType->id))
        ->assertOk();

    expect($programType->fresh()->status)->toBe('active');
});
