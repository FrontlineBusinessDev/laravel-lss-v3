<?php

use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── settings/import (CSR shell) ───────────────────────────────────────────────

test('developer can open the import module', function () {
    $this->withoutVite();

    $this->actingAs(userWithRole('developer'))
        ->get(route('settings.import.index'))
        ->assertOk();
});

test('admin can open the import module', function () {
    $this->withoutVite();

    $this->actingAs(userWithRole('admin'))
        ->get(route('settings.import.index'))
        ->assertOk();
});

test('trainer cannot open the import module', function () {
    $this->actingAs(userWithRole('trainer'))
        ->get(route('settings.import.index'))
        ->assertForbidden();
});

test('trainee cannot open the import module', function () {
    $this->actingAs(userWithRole('trainee'))
        ->get(route('settings.import.index'))
        ->assertForbidden();
});

// ── settings/import/logs/pagination-search ────────────────────────────────────

test('developer can list import logs', function () {
    $this->actingAs(userWithRole('developer'))
        ->getJson(route('settings.import.logs.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('admin can list import logs', function () {
    $this->actingAs(userWithRole('admin'))
        ->getJson(route('settings.import.logs.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('trainer cannot list import logs', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('settings.import.logs.pagination-search'))
        ->assertForbidden();
});

test('trainee cannot list import logs', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('settings.import.logs.pagination-search'))
        ->assertForbidden();
});
