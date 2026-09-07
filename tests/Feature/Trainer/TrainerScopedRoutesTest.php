<?php

use App\Models\Announcement;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Access: trainer can reach its own scoped routes ──────────────────────────

test('trainer can reach the batches and trainees pagination-search routes', function () {
    $trainer = userWithRole('trainer');

    $this->actingAs($trainer)
        ->getJson(route('trainer.batches.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);

    $this->actingAs($trainer)
        ->getJson(route('trainer.trainees.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

// ── Access: every other role is forbidden ────────────────────────────────────

test('developer, admin, and trainee are forbidden from the trainer-scoped batches route', function () {
    foreach (['developer', 'admin', 'trainee'] as $role) {
        $this->actingAs(userWithRole($role))
            ->getJson(route('trainer.batches.pagination-search'))
            ->assertForbidden();
    }
});

test('developer, admin, and trainee are forbidden from the trainer-scoped trainees route', function () {
    foreach (['developer', 'admin', 'trainee'] as $role) {
        $this->actingAs(userWithRole($role))
            ->getJson(route('trainer.trainees.pagination-search'))
            ->assertForbidden();
    }
});

// ── Trainer-scoped announcements CRUD lifecycle ──────────────────────────────

test('trainer can create, archive, and restore their own batch-scoped announcement', function () {
    $trainer = userWithRole('trainer');
    $batch = makeBatch();
    $batch->trainers()->attach($trainer->id);

    $created = $this->actingAs($trainer)
        ->postJson(route('trainer.announcements.store'), [
            'subject' => 'Reminder: submit your requirements',
            'description' => 'Please submit ASAP.',
            'audience_batch_id' => $batch->id,
        ])
        ->assertCreated();

    $id = $created->json('data.id');
    expect(Announcement::find($id)->created_by_id)->toBe($trainer->id);

    $this->actingAs($trainer)
        ->patchJson(route('trainer.announcements.archive', $id))
        ->assertOk();
    expect(Announcement::find($id)->status)->toBe('inactive');

    $this->actingAs($trainer)
        ->patchJson(route('trainer.announcements.restore', $id))
        ->assertOk();
    expect(Announcement::find($id)->status)->toBe('active');
});

test('a trainer cannot target a batch they are not assigned to', function () {
    $trainer = userWithRole('trainer');
    $otherBatch = makeBatch();

    $this->actingAs($trainer)
        ->postJson(route('trainer.announcements.store'), [
            'subject' => 'Not my batch',
            'audience_batch_id' => $otherBatch->id,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('audience_batch_id');
});
