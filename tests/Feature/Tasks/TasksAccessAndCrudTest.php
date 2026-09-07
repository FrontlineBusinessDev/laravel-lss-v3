<?php

use App\Models\Task;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Access control ───────────────────────────────────────────────────────────

test('developer can list tasks', function () {
    $this->actingAs(userWithRole('developer'))
        ->getJson(route('tasks.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('admin can list tasks', function () {
    $this->actingAs(userWithRole('admin'))
        ->getJson(route('tasks.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('trainer can list tasks', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('tasks.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('trainee is forbidden from the tasks api', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('tasks.pagination-search'))
        ->assertForbidden();
});

test('trainee is forbidden from the daily task sheet api', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('tasks.daily-task.pagination-search'))
        ->assertForbidden();
});

// ── CRUD ─────────────────────────────────────────────────────────────────────

test('developer can create a task fanned out to selected trainees', function () {
    $batch = makeBatch();
    $trainee = makeTrainee(['batch_id' => $batch->id]);
    $trainer = userWithRole('trainer');

    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('tasks.store'), [
            'date' => now()->toDateString(),
            'batch_id' => $batch->id,
            'trainee_ids' => [$trainee->id],
            'trainer_id' => $trainer->id,
            'task' => 'Build the login page',
            'description' => 'Implement the auth screen',
            'time_goal' => 4,
            'priority' => 'high',
        ])
        ->assertCreated();

    $data = $response->json('data');
    expect($data)->toHaveCount(1);

    $task = Task::where('trainee_id', $trainee->id)->first();
    expect($task)->not->toBeNull()
        ->and($task->task)->toBe('Build the login page')
        ->and($task->batch_id)->toBe($batch->id)
        ->and($task->trainer_id)->toBe($trainer->id)
        ->and($task->status)->toBe('open');
});

test('creating a task without a task name fails validation', function () {
    $batch = makeBatch();
    $trainee = makeTrainee(['batch_id' => $batch->id]);
    $trainer = userWithRole('trainer');

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('tasks.store'), [
            'date' => now()->toDateString(),
            'batch_id' => $batch->id,
            'trainee_ids' => [$trainee->id],
            'trainer_id' => $trainer->id,
            'time_goal' => 4,
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('task');
});

test('a task can be hard-deleted regardless of status', function () {
    $batch = makeBatch();
    $trainee = makeTrainee(['batch_id' => $batch->id]);
    $trainer = userWithRole('trainer');

    $task = Task::create([
        'date' => now()->toDateString(),
        'batch_id' => $batch->id,
        'trainee_id' => $trainee->id,
        'trainer_id' => $trainer->id,
        'task' => 'Sample task',
        'time_goal' => 2,
        'status' => 'open',
        'time_spent' => 0,
        'task_group_id' => (string) Str::uuid(),
    ]);

    $this->actingAs(userWithRole('developer'))
        ->deleteJson(route('tasks.destroy', $task->id))
        ->assertStatus(204);

    expect(Task::find($task->id))->toBeNull();
});

test('a task can be completed then reopened', function () {
    $batch = makeBatch();
    $trainee = makeTrainee(['batch_id' => $batch->id]);
    $trainer = userWithRole('trainer');

    $task = Task::create([
        'date' => now()->toDateString(),
        'batch_id' => $batch->id,
        'trainee_id' => $trainee->id,
        'trainer_id' => $trainer->id,
        'task' => 'Sample task',
        'time_goal' => 2,
        'status' => 'open',
        'time_spent' => 0,
        'task_group_id' => (string) Str::uuid(),
    ]);

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('tasks.complete', $task->id))
        ->assertOk();

    expect($task->fresh()->status)->toBe('completed');

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('tasks.reopen', $task->id))
        ->assertOk();

    expect($task->fresh()->status)->toBe('open');
});
