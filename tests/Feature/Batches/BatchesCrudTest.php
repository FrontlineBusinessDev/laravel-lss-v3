<?php

use App\Models\AcademicIndustry;
use App\Models\AcademicProgramType;
use App\Models\Batches;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/**
 * /batches sits under the top-level `auth` group with no `permission:`/
 * `role:` middleware (routes/web.php ~line 172) — access is instead enforced
 * entirely by BatchesPolicy (`manage batches`), which developer holds via
 * RoleSeeder. Developer-actor only, per task instructions.
 */
function validBatchPayload(): array
{
    if (! AcademicIndustry::query()->exists()) {
        AcademicIndustry::create(['status' => 'active', 'name' => 'Test Industry']);
    }
    if (! AcademicProgramType::query()->exists()) {
        AcademicProgramType::create(['status' => 'active', 'name' => 'Test Program Type']);
    }

    return [
        'setup' => 'f2f',
        'is_public_url_enable' => true,
        'date_started' => '2026-01-01',
        'projected_end_date' => '2026-03-01',
        'academic_industry_id' => AcademicIndustry::first()->id,
        'academic_program_type_id' => AcademicProgramType::first()->id,
    ];
}

test('developer can create a batch', function () {
    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('batches.store'), validBatchPayload())
        ->assertCreated();

    expect(Batches::where('id', $response->json('data.id'))->exists())->toBeTrue();
    expect($response->json('data.batch_code'))->not->toBeNull();
});

test('creating a batch without a setup value fails validation', function () {
    $payload = validBatchPayload();
    unset($payload['setup']);

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('batches.store'), $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors('setup');
});

test('archiving then restoring a batch toggles its status', function () {
    $batch = makeBatch();
    $developer = userWithRole('developer');

    $this->actingAs($developer)
        ->patchJson(route('batches.archive', $batch->id))
        ->assertOk();
    expect($batch->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('batches.restore', $batch->id))
        ->assertOk();
    expect($batch->fresh()->status)->toBe('active');
});
