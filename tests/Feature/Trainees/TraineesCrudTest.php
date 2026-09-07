<?php

use App\Models\PartnerSchools;
use App\Models\Trainees;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/**
 * /trainees sits under the top-level `auth` group with no `permission:`/
 * `role:` middleware (routes/web.php ~line 191) — access is instead enforced
 * entirely by TraineesPolicy (`manage trainees`), which developer holds via
 * RoleSeeder. Developer-actor only, per task instructions.
 */
function validTraineePayload(int $batchId, int $schoolId, array $overrides = []): array
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

test('developer can create a trainee', function () {
    $batch = makeBatch();
    // makeTrainee() seeds the PartnerSchools/AcademicProgram/AcademicLevel
    // prerequisite rows Trainees::factory() needs; the trainee it returns is
    // discarded here, we only need the seeded PartnerSchools row's id.
    makeTrainee(['batch_id' => $batch->id]);
    $school = PartnerSchools::first();

    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('trainees.store'), validTraineePayload($batch->id, $school->id))
        ->assertCreated();

    expect(Trainees::where('id', $response->json('data.id'))->exists())->toBeTrue();
});

test('creating a trainee without an email fails validation', function () {
    $batch = makeBatch();
    makeTrainee(['batch_id' => $batch->id]);
    $school = PartnerSchools::first();

    $payload = validTraineePayload($batch->id, $school->id);
    unset($payload['email']);

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('trainees.store'), $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors('email');
});

test('archiving then restoring a trainee toggles its status', function () {
    $trainee = makeTrainee();
    $developer = userWithRole('developer');

    $this->actingAs($developer)
        ->patchJson(route('trainees.archive', $trainee->id))
        ->assertOk();
    expect($trainee->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('trainees.restore', $trainee->id))
        ->assertOk();
    expect($trainee->fresh()->status)->toBe('active');
});
