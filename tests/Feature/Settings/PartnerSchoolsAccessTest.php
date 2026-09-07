<?php

use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('developer can list partner schools', function () {
    $this->actingAs(userWithRole('developer'))
        ->getJson(route('settings.partner-schools.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('admin can list partner schools', function () {
    $this->actingAs(userWithRole('admin'))
        ->getJson(route('settings.partner-schools.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('trainer cannot list partner schools', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('settings.partner-schools.pagination-search'))
        ->assertForbidden();
});

test('trainee cannot list partner schools', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('settings.partner-schools.pagination-search'))
        ->assertForbidden();
});
