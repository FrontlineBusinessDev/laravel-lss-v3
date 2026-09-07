<?php

use App\Models\CertificateCitation;
use App\Models\CertificateTemplate;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/**
 * Both /certificates/citations and /certificates/templates sit under the
 * top-level `auth` group with no `permission:`/`role:` middleware
 * (routes/web.php ~lines 370-371) — access is instead enforced entirely by
 * CertificateCitationPolicy/CertificateTemplatePolicy (`manage certificates`),
 * which developer holds via RoleSeeder. Developer-actor only, per task
 * instructions.
 */

// ── Citations ─────────────────────────────────────────────────────────────

test('developer can create a citation', function () {
    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('certificates.citations.store'), [
            'title' => 'Outstanding Performance',
            'applies_to' => 'trainee',
            'body_text' => 'Awarded for outstanding performance.',
            'status' => 'active',
        ])
        ->assertCreated();

    expect(CertificateCitation::where('id', $response->json('data.id'))->exists())->toBeTrue();
});

test('creating a citation without a title fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('certificates.citations.store'), [
            'applies_to' => 'trainee',
            'body_text' => 'Some body text.',
            'status' => 'active',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('title');
});

test('archiving then restoring a citation toggles its status', function () {
    $developer = userWithRole('developer');
    $citation = CertificateCitation::create([
        'title' => 'Perfect Attendance',
        'applies_to' => 'trainee',
        'body_text' => 'Awarded for perfect attendance.',
        'status' => 'active',
        'created_by' => $developer->id,
    ]);

    $this->actingAs($developer)
        ->patchJson(route('certificates.citations.archive', $citation->id))
        ->assertOk();
    expect($citation->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('certificates.citations.restore', $citation->id))
        ->assertOk();
    expect($citation->fresh()->status)->toBe('active');
});

// ── Certificate templates ─────────────────────────────────────────────────

function validTemplatePayload(array $overrides = []): array
{
    return [
        'certificate_type' => 'trainee',
        'name' => 'Standard Trainee Certificate',
        'layout' => [
            ['id' => 'el1', 'type' => 'text', 'x' => 10, 'y' => 10, 'width' => 100],
        ],
        'status' => 'active',
        ...$overrides,
    ];
}

test('developer can create a certificate template', function () {
    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('certificates.templates.store'), validTemplatePayload())
        ->assertCreated();

    expect(CertificateTemplate::where('id', $response->json('data.id'))->exists())->toBeTrue();
});

test('creating a certificate template without a name fails validation', function () {
    $payload = validTemplatePayload();
    unset($payload['name']);

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('certificates.templates.store'), $payload)
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

test('archiving then restoring a non-default certificate template toggles its status', function () {
    $developer = userWithRole('developer');
    $template = CertificateTemplate::create([
        ...validTemplatePayload(),
        'is_default' => false,
        'created_by' => $developer->id,
    ]);

    $this->actingAs($developer)
        ->patchJson(route('certificates.templates.archive', $template->id))
        ->assertOk();
    expect($template->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('certificates.templates.restore', $template->id))
        ->assertOk();
    expect($template->fresh()->status)->toBe('active');
});
