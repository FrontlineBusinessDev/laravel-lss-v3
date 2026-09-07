<?php

use App\Models\BehavioralEvaluation;
use App\Models\BehavioralEvaluationAnswer;
use App\Models\BehavioralQuestion;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Access control — `manage ratings` level (task-rating / behavioral-rating) ─

test('developer can access the task rating trainees endpoint', function () {
    $batch = makeBatch();

    $this->actingAs(userWithRole('developer'))
        ->getJson(route('ratings.task-rating.trainees', ['batch_id' => $batch->id]))
        ->assertOk();
});

test('admin can access the task rating trainees endpoint', function () {
    $batch = makeBatch();

    $this->actingAs(userWithRole('admin'))
        ->getJson(route('ratings.task-rating.trainees', ['batch_id' => $batch->id]))
        ->assertOk();
});

test('trainer can access the task rating trainees endpoint for their own assigned batch', function () {
    $batch = makeBatch();
    $trainer = userWithRole('trainer');
    $trainer->assignedBatches()->attach($batch->id);

    $this->actingAs($trainer)
        ->getJson(route('ratings.task-rating.trainees', ['batch_id' => $batch->id]))
        ->assertOk();
});

test('trainee is forbidden from the task rating trainees endpoint', function () {
    $batch = makeBatch();

    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('ratings.task-rating.trainees', ['batch_id' => $batch->id]))
        ->assertForbidden();
});

// ── Access control — nested `manage behavioral questions` permission ─────────

test('developer can list behavioral questions', function () {
    $this->actingAs(userWithRole('developer'))
        ->getJson(route('ratings.behavioral-questions.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('admin can list behavioral questions', function () {
    $this->actingAs(userWithRole('admin'))
        ->getJson(route('ratings.behavioral-questions.pagination-search'))
        ->assertOk();
});

test('trainer holds manage ratings but is forbidden from behavioral questions setup', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('ratings.behavioral-questions.pagination-search'))
        ->assertForbidden();
});

test('trainee is forbidden from behavioral questions setup', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('ratings.behavioral-questions.pagination-search'))
        ->assertForbidden();
});

// ── Behavioral Questions CRUD ─────────────────────────────────────────────────

test('developer can create a behavioral question', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('ratings.behavioral-questions.store'), [
            'question' => 'Does the trainee arrive on time?',
            'section' => 'Punctuality',
            'type' => 'rating',
        ])
        ->assertCreated();

    $question = BehavioralQuestion::where('question', 'Does the trainee arrive on time?')->first();

    expect($question)->not->toBeNull()
        ->and($question->section)->toBe('Punctuality')
        ->and($question->type)->toBe('rating')
        ->and($question->status)->toBe('active');
});

test('creating a behavioral question without a section fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('ratings.behavioral-questions.store'), [
            'question' => 'Does the trainee arrive on time?',
            'type' => 'rating',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('section');
});

test('a behavioral question can be archived then restored', function () {
    $question = BehavioralQuestion::create([
        'question' => 'Sample question',
        'section' => 'General',
        'type' => 'rating',
        'status' => 'active',
    ]);

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('ratings.behavioral-questions.archive', $question->id))
        ->assertOk();

    expect($question->fresh()->status)->toBe('inactive');

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('ratings.behavioral-questions.restore', $question->id))
        ->assertOk();

    expect($question->fresh()->status)->toBe('active');
});

test('a behavioral question still referenced by an evaluation answer cannot be destroyed', function () {
    $batch = makeBatch();
    $trainee = makeTrainee(['batch_id' => $batch->id]);
    $trainer = userWithRole('trainer');

    $question = BehavioralQuestion::create([
        'question' => 'Sample question',
        'section' => 'General',
        'type' => 'rating',
        'status' => 'inactive',
    ]);

    $evaluation = BehavioralEvaluation::create([
        'batch_id' => $batch->id,
        'trainee_id' => $trainee->id,
        'evaluator_id' => $trainer->id,
        'total_score' => 90,
    ]);

    BehavioralEvaluationAnswer::create([
        'evaluation_id' => $evaluation->id,
        'question_id' => $question->id,
        'score' => 5,
    ]);

    $this->actingAs(userWithRole('developer'))
        ->deleteJson(route('ratings.behavioral-questions.destroy', $question->id))
        ->assertStatus(422);

    expect(BehavioralQuestion::find($question->id))->not->toBeNull();
});
