<?php

use App\Models\AcademicLevel;
use App\Models\AcademicProgram;
use App\Models\PartnerSchools;
use App\Models\Trainees;
use App\Support\Statuses;
use App\Support\TraineeAccountLinker;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function chainTestTraineePayload(int $batchId, int $schoolId, array $overrides = []): array
{
    return [
        'batch_id' => $batchId,
        'school_id' => $schoolId,
        'public_url_id' => Str::ulid()->toBase32(),
        'first_name' => 'New',
        'last_name' => 'Trainee',
        'email' => 'new.trainee.'.Str::random(8).'@example.com',
        'birthday' => '2000-01-01',
        'birth_place' => 'Manila',
        'gender' => 'male',
        'mobile_number' => '09171234567',
        'emergency_contact_name' => 'Emergency Contact',
        'emergency_contact_number' => '09171234567',
        'required_hours' => 300,
        'address' => '123 Main St',
        ...$overrides,
    ];
}

/** Full trainee-import CSV row shape (see importUtils.ts's trainees template) — every column present, as a real CSV upload always sends. */
function chainTestImportRow(array $overrides = []): array
{
    return [
        'first_name' => 'Row',
        'last_name' => 'Trainee',
        'email' => 'row@example.test',
        'batch_code' => 'FBS-000',
        'school_name' => null,
        'program_name' => null,
        'level_name' => null,
        'gender' => null,
        'birthday' => null,
        'birth_place' => null,
        'address' => null,
        'mobile_number' => null,
        'emergency_contact_name' => null,
        'emergency_contact_number' => null,
        'required_hours' => null,
        'f2f_hours_rate' => null,
        'online_hours_rate' => null,
        'discount_percent' => null,
        'is_active' => 1,
        'created_at' => null,
        'updated_at' => null,
        ...$overrides,
    ];
}

// ── admin "Add Trainee" screen ──────────────────────────────────────────────

test('admin can create a trainee for an email that already has an inactive enrollment', function () {
    $existing = makeTrainee(['status' => Statuses::INACTIVE, 'email' => 'returning@example.test']);
    $newBatch = makeBatch();
    $school = PartnerSchools::first();

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('trainees.store'), chainTestTraineePayload(
            $newBatch->id,
            $school->id,
            ['email' => 'returning@example.test'],
        ))
        ->assertCreated();

    expect(Trainees::where('email', 'returning@example.test')->count())->toBe(2);
});

test('admin creating a new enrollment for an already-active email supersedes the older row', function () {
    $first = makeTrainee(['status' => Statuses::ACTIVE, 'email' => 'already-active@example.test']);
    $newBatch = makeBatch();
    $school = PartnerSchools::first();

    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('trainees.store'), chainTestTraineePayload(
            $newBatch->id,
            $school->id,
            ['email' => 'already-active@example.test'],
        ))
        ->assertCreated();

    expect(Trainees::where('email', 'already-active@example.test')->count())->toBe(2);
    expect($first->fresh()->status)->toBe(Statuses::INACTIVE);
    expect(Trainees::find($response->json('data.id'))->status)->toBe(Statuses::ACTIVE);
});

test('creating a second enrollment row chains previous_trainee_id to the first', function () {
    $first = makeTrainee(['status' => Statuses::INACTIVE, 'email' => 'chained@example.test']);
    $newBatch = makeBatch();
    $school = PartnerSchools::first();

    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('trainees.store'), chainTestTraineePayload(
            $newBatch->id,
            $school->id,
            ['email' => 'chained@example.test'],
        ))
        ->assertCreated();

    $second = Trainees::find($response->json('data.id'));
    expect($second->previous_trainee_id)->toBe($first->id);
});

// ── created_at order, not creation order, decides the chain ────────────────

test('importing a row with an older legacy created_at is spliced before an existing newer row, not appended', function () {
    $existing = makeTrainee([
        'status' => Statuses::INACTIVE,
        'email' => 'legacy@example.test',
        'created_at' => '2024-06-01 00:00:00',
    ]);
    $batch = makeBatch(['batch_code' => 'FBS-LEGACY']);

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.import.trainees'), [
            'file_name' => 'import.csv',
            'rows' => [chainTestImportRow([
                'first_name' => 'Older',
                'last_name' => 'Row',
                'email' => 'legacy@example.test',
                'batch_code' => 'FBS-LEGACY',
                'is_active' => 0,
                'created_at' => '2022-05-01 00:00:00',
            ])],
        ])
        ->assertOk();

    $older = Trainees::where('email', 'legacy@example.test')->where('id', '!=', $existing->id)->firstOrFail();
    expect($older->previous_trainee_id)->toBeNull();
    expect($existing->fresh()->previous_trainee_id)->toBe($older->id);
});

test('trainee import creates a new linked enrollment instead of rejecting an existing email', function () {
    makeTrainee(['status' => Statuses::INACTIVE, 'email' => 're-enroll@example.test']);
    $batch = makeBatch(['batch_code' => 'FBS-REENROLL']);

    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.import.trainees'), [
            'file_name' => 'import.csv',
            'rows' => [chainTestImportRow([
                'first_name' => 'Returning',
                'last_name' => 'Trainee',
                'email' => 're-enroll@example.test',
                'batch_code' => 'FBS-REENROLL',
                'is_active' => 1,
            ])],
        ])
        ->assertOk();

    expect($response->json('data.created_count'))->toBe(1);
    expect($response->json('data.errors'))->toBe([]);
    expect(Trainees::where('email', 're-enroll@example.test')->count())->toBe(2);
});

// ── shared portal login follows the current enrollment ──────────────────────

test('the shared login account moves to the new head when a newer active enrollment is created', function () {
    $first = makeTrainee(['status' => Statuses::ACTIVE, 'email' => 'login-move@example.test']);
    [$user] = TraineeAccountLinker::link($first);

    $first->update(['status' => Statuses::INACTIVE]);

    $second = makeTrainee(['status' => Statuses::ACTIVE, 'email' => 'login-move@example.test']);

    expect($first->fresh()->user_id)->toBeNull();
    expect($second->fresh()->user_id)->toBe($user->id);
    expect(\App\Models\User::where('email', 'login-move@example.test')->count())->toBe(1);
});

// ── trainee portal enrollment history ────────────────────────────────────────

test('MyInfoController exposes enrollment_history including archived prior enrollments', function () {
    $this->withoutVite();
    $user = userWithRole('trainee');
    $first = makeTrainee(['status' => Statuses::INACTIVE, 'email' => 'history@example.test']);
    $second = makeTrainee(['status' => Statuses::ACTIVE, 'email' => 'history@example.test', 'user_id' => $user->id]);

    $this->actingAs($user)
        ->get(route('trainee.my-info.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('trainee/my-info/index')
            ->where('isCurrentEnrollment', true)
            ->where(
                'enrollmentHistory',
                fn ($history) => collect($history)->pluck('id')->all() === [$first->id, $second->fresh()->id],
            ));
});

// ── public self-registration ────────────────────────────────────────────────

function makeRegistrationBatch(): \App\Models\Batches
{
    $trainee = makeTrainee();
    $industry = \App\Models\AcademicIndustry::first() ?? \App\Models\AcademicIndustry::create(['status' => 'active', 'name' => 'IT']);
    $programType = \App\Models\AcademicProgramType::first() ?? \App\Models\AcademicProgramType::create(['status' => 'active', 'name' => 'OJT']);

    return makeBatch([
        'status' => Statuses::ACTIVE,
        'is_public_url_enable' => true,
        'academic_industry_id' => $industry->id,
        'academic_program_type_id' => $programType->id,
    ]);
}

function registrationPayload(array $overrides = []): array
{
    $school = PartnerSchools::first();
    $program = AcademicProgram::first();
    $level = AcademicLevel::first();

    return [
        'first_name' => 'Applicant',
        'last_name' => 'One',
        'email' => 'applicant.'.Str::random(8).'@example.test',
        'birthday' => '2000-01-01',
        'birth_place' => 'Manila',
        'gender' => 'male',
        'mobile_number' => '09171234567',
        'emergency_contact_name' => 'Emergency Contact',
        'emergency_contact_number' => '09171234567',
        'required_hours' => 300,
        'address' => '123 Main St',
        'school_id' => $school->id,
        'academic_program_id' => $program->id,
        'academic_level_id' => $level->id,
        'resume' => UploadedFile::fake()->create('resume.pdf', 100, 'application/pdf'),
        ...$overrides,
    ];
}

test('public registration allows re-applying after the prior enrollment is archived', function () {
    Storage::fake(config('filesystems.default'));
    $batch = makeRegistrationBatch();
    makeTrainee(['status' => Statuses::INACTIVE, 'email' => 'reapply@example.test']);

    $this->postJson(
        route('public.register.store', $batch->public_registration_url_id),
        registrationPayload(['email' => 'reapply@example.test']),
    )->assertOk()->assertJson(['success' => true]);

    expect(Trainees::where('email', 'reapply@example.test')->count())->toBe(2);
});

test('public registration re-applying while a prior enrollment is still pending supersedes it', function () {
    Storage::fake(config('filesystems.default'));
    $batch = makeRegistrationBatch();
    $first = makeTrainee(['status' => Statuses::PENDING, 'email' => 'still-pending@example.test']);

    $this->postJson(
        route('public.register.store', $batch->public_registration_url_id),
        registrationPayload(['email' => 'still-pending@example.test']),
    )->assertOk()->assertJson(['success' => true]);

    expect(Trainees::where('email', 'still-pending@example.test')->count())->toBe(2);
    expect($first->fresh()->status)->toBe(Statuses::INACTIVE);
});
