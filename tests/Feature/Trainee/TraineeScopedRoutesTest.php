<?php

use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// Every trainee-scoped JSON controller (Trainee\Tasks\TasksController,
// Trainee\Payments\PaymentsController, Trainee\Ratings\RatingsController,
// Trainee\Announcements\AnnouncementsController) resolves "own" data via
// Trainees::where('user_id', auth()->id())->firstOrFail() — a trainee-role
// user with no linked Trainees row would 404 on these routes, so every
// acting trainee user here must have one attached via user_id.

test('trainee can reach the tasks and payments pagination-search routes', function () {
    $user = userWithRole('trainee');
    makeTrainee(['user_id' => $user->id]);

    $this->actingAs($user)
        ->getJson(route('trainee.tasks.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);

    $this->actingAs($user)
        ->getJson(route('trainee.payments.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('developer, admin, and trainer are forbidden from the trainee-scoped tasks route', function () {
    foreach (['developer', 'admin', 'trainer'] as $role) {
        $this->actingAs(userWithRole($role))
            ->getJson(route('trainee.tasks.pagination-search'))
            ->assertForbidden();
    }
});

test('developer, admin, and trainer are forbidden from the trainee-scoped payments route', function () {
    foreach (['developer', 'admin', 'trainer'] as $role) {
        $this->actingAs(userWithRole($role))
            ->getJson(route('trainee.payments.pagination-search'))
            ->assertForbidden();
    }
});
