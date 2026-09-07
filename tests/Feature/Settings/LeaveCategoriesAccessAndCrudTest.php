<?php

use App\Models\LeaveCategory;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Access control ───────────────────────────────────────────────────────────

test('developer can list leave categories', function () {
    $this->actingAs(userWithRole('developer'))
        ->getJson(route('settings.leave-categories.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('admin can list leave categories', function () {
    $this->actingAs(userWithRole('admin'))
        ->getJson(route('settings.leave-categories.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('trainer cannot list leave categories', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('settings.leave-categories.pagination-search'))
        ->assertForbidden();
});

test('trainee cannot list leave categories', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('settings.leave-categories.pagination-search'))
        ->assertForbidden();
});

// ── CRUD ──────────────────────────────────────────────────────────────────────

test('a leave category can be created', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.leave-categories.store'), [
            'status' => 'active',
            'name' => 'Sick Leave',
            'max_days' => 10,
            'max_instances' => 3,
        ])
        ->assertCreated();

    $category = LeaveCategory::where('name', 'Sick Leave')->sole();

    expect($category->max_days)->toBe(10)
        ->and($category->max_instances)->toBe(3)
        ->and($category->status)->toBe('active');
});

test('creating a leave category without a name fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.leave-categories.store'), [
            'status' => 'active',
            'max_days' => 10,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('name');
});

test('a leave category can be archived then restored', function () {
    $developer = userWithRole('developer');
    $category = LeaveCategory::create([
        'status' => 'active',
        'name' => 'Vacation Leave',
        'max_days' => 15,
        'max_instances' => 2,
    ]);

    $this->actingAs($developer)
        ->patchJson(route('settings.leave-categories.archive', $category->id))
        ->assertOk();

    expect($category->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('settings.leave-categories.restore', $category->id))
        ->assertOk();

    expect($category->fresh()->status)->toBe('active');
});
