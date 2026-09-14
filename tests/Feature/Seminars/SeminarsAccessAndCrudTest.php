<?php

use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Access control ───────────────────────────────────────────────────────────
//
// Page-load + permission checks. Real CRUD/mutation coverage lives in
// SeminarModuleTest.php.

test('developer can view the list of seminars page', function () {
    $this->withoutVite();

    $this->actingAs(userWithRole('developer'))
        ->get(route('seminars.list-of-seminars.index'))
        ->assertOk();
});

test('admin can view the seminar participants page', function () {
    $this->withoutVite();

    $this->actingAs(userWithRole('admin'))
        ->get(route('seminars.participants.index'))
        ->assertOk();
});

test('admin can view the seminar email notification page', function () {
    $this->withoutVite();

    $this->actingAs(userWithRole('admin'))
        ->get(route('seminars.email-notification.index'))
        ->assertOk();
});

test('admin can use the seminar lookup feed', function () {
    $this->actingAs(userWithRole('admin'))
        ->getJson(route('seminars.lookup'))
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('trainer is forbidden from the list of seminars page', function () {
    $this->withoutVite();

    $this->actingAs(userWithRole('trainer'))
        ->get(route('seminars.list-of-seminars.index'))
        ->assertForbidden();
});

test('trainee is forbidden from the seminar participants page', function () {
    $this->withoutVite();

    $this->actingAs(userWithRole('trainee'))
        ->get(route('seminars.participants.index'))
        ->assertForbidden();
});

test('trainee is forbidden from the seminar lookup feed', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('seminars.lookup'))
        ->assertForbidden();
});
