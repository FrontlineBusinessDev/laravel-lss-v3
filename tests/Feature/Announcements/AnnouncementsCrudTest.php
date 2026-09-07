<?php

use App\Models\Announcement;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/**
 * /announcements sits under the top-level `auth` group with no
 * `permission:`/`role:` middleware (routes/web.php ~line 378) — access is
 * instead enforced entirely by AnnouncementPolicy (`manage announcements`),
 * which developer holds via RoleSeeder. Developer-actor only, per task
 * instructions. Uses the real controller class App\Http\Controllers\v1\
 * Developer\Announcement\AnnoucementController (note the source typo).
 */
test('developer can create an announcement', function () {
    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('announcements.store'), [
            'subject' => 'System maintenance tonight',
            'description' => 'The platform will be briefly unavailable.',
            'audience_type' => 'all',
        ])
        ->assertCreated();

    expect(Announcement::where('id', $response->json('data.id'))->exists())->toBeTrue();
});

test('creating an announcement without a subject fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('announcements.store'), [
            'audience_type' => 'all',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('subject');
});

test('archiving then restoring an announcement toggles its status', function () {
    $developer = userWithRole('developer');
    $announcement = Announcement::create([
        'subject' => 'Holiday schedule',
        'audience_type' => 'all',
        'status' => 'active',
        'created_by_id' => $developer->id,
    ]);

    $this->actingAs($developer)
        ->patchJson(route('announcements.archive', $announcement->id))
        ->assertOk();
    expect($announcement->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('announcements.restore', $announcement->id))
        ->assertOk();
    expect($announcement->fresh()->status)->toBe('active');
});
