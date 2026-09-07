<?php

use App\Models\GroupDiscount;
use App\Models\HoursDiscount;
use App\Models\Rate;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Access control ───────────────────────────────────────────────────────────

test('developer can list hours and group discounts', function () {
    $developer = userWithRole('developer');

    $this->actingAs($developer)
        ->getJson(route('settings.rates.hours-discounts.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);

    $this->actingAs($developer)
        ->getJson(route('settings.rates.group-discounts.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('admin can list hours and group discounts', function () {
    $admin = userWithRole('admin');

    $this->actingAs($admin)
        ->getJson(route('settings.rates.hours-discounts.pagination-search'))
        ->assertOk();

    $this->actingAs($admin)
        ->getJson(route('settings.rates.group-discounts.pagination-search'))
        ->assertOk();
});

test('trainer cannot list hours or group discounts', function () {
    $trainer = userWithRole('trainer');

    $this->actingAs($trainer)
        ->getJson(route('settings.rates.hours-discounts.pagination-search'))
        ->assertForbidden();

    $this->actingAs($trainer)
        ->getJson(route('settings.rates.group-discounts.pagination-search'))
        ->assertForbidden();
});

test('trainee cannot list hours or group discounts', function () {
    $trainee = userWithRole('trainee');

    $this->actingAs($trainee)
        ->getJson(route('settings.rates.hours-discounts.pagination-search'))
        ->assertForbidden();

    $this->actingAs($trainee)
        ->getJson(route('settings.rates.group-discounts.pagination-search'))
        ->assertForbidden();
});

test('trainer and trainee cannot update the default rates', function () {
    $this->actingAs(userWithRole('trainer'))
        ->putJson(route('settings.rates.default.update'), ['f2f' => 100, 'online' => 80])
        ->assertForbidden();

    $this->actingAs(userWithRole('trainee'))
        ->putJson(route('settings.rates.default.update'), ['f2f' => 100, 'online' => 80])
        ->assertForbidden();
});

test('developer can update the default rates', function () {
    $this->actingAs(userWithRole('developer'))
        ->putJson(route('settings.rates.default.update'), ['f2f' => 150.50, 'online' => 100.25])
        ->assertOk();

    expect(Rate::where('setup', 'f2f')->sole()->rate_per_hour)->toEqual(150.50)
        ->and(Rate::where('setup', 'online')->sole()->rate_per_hour)->toEqual(100.25);
});

// ── Hours discount CRUD (no status column: no archive/restore) ───────────────

test('an hours discount can be created', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.rates.hours-discounts.store'), [
            'min_hours' => 40,
            'discount_percentage' => 5,
        ])
        ->assertCreated();

    $discount = HoursDiscount::where('min_hours', 40)->sole();

    expect((float) $discount->discount_percentage)->toEqual(5.0);
});

test('creating an hours discount without min_hours fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.rates.hours-discounts.store'), [
            'discount_percentage' => 5,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('min_hours');
});

test('an hours discount can be updated', function () {
    $discount = HoursDiscount::create(['min_hours' => 20, 'discount_percentage' => 2]);

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.rates.hours-discounts.update', $discount->id), [
            'min_hours' => 20,
            'discount_percentage' => 10,
        ])
        ->assertOk();

    expect((float) $discount->fresh()->discount_percentage)->toEqual(10.0);
});

// ── Group discount CRUD (no status column: no archive/restore) ───────────────

test('a group discount can be created', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.rates.group-discounts.store'), [
            'min_trainees' => 10,
            'discount_percentage' => 8,
        ])
        ->assertCreated();

    $discount = GroupDiscount::where('min_trainees', 10)->sole();

    expect((float) $discount->discount_percentage)->toEqual(8.0);
});

test('creating a group discount without min_trainees fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.rates.group-discounts.store'), [
            'discount_percentage' => 8,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('min_trainees');
});

test('a group discount can be updated', function () {
    $discount = GroupDiscount::create(['min_trainees' => 5, 'discount_percentage' => 3]);

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.rates.group-discounts.update', $discount->id), [
            'min_trainees' => 5,
            'discount_percentage' => 12,
        ])
        ->assertOk();

    expect((float) $discount->fresh()->discount_percentage)->toEqual(12.0);
});
