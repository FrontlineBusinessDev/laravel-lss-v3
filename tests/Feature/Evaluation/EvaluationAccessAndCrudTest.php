<?php

use App\Models\AcademicIndustry;
use App\Models\EvaluationTrainerQuestion;
use App\Models\TrainerEvaluation;
use App\Models\TrainerEvaluationAnswer;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Access control ───────────────────────────────────────────────────────────

test('developer can list trainer questionnaire questions', function () {
    $this->actingAs(userWithRole('developer'))
        ->getJson(route('evaluation.trainer-questionnaire.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('admin can list seminar questionnaire questions', function () {
    $this->actingAs(userWithRole('admin'))
        ->getJson(route('evaluation.seminar-questionnaire.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('trainer is forbidden from the trainer questionnaire api', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('evaluation.trainer-questionnaire.pagination-search'))
        ->assertForbidden();
});

test('trainee is forbidden from the seminar questionnaire api', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('evaluation.seminar-questionnaire.pagination-search'))
        ->assertForbidden();
});

test('trainer is forbidden from the evaluation overview metrics', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('evaluation.overview.metrics'))
        ->assertForbidden();
});

test('developer can view the evaluation overview metrics', function () {
    $this->actingAs(userWithRole('developer'))
        ->getJson(route('evaluation.overview.metrics'))
        ->assertOk();
});

// ── Trainer Questionnaire CRUD ────────────────────────────────────────────────

function makeAcademicIndustryForEvaluation(): AcademicIndustry
{
    return AcademicIndustry::firstOrCreate(
        ['name' => 'Test Industry'],
        ['status' => 'active'],
    );
}

test('developer can create a trainer questionnaire question', function () {
    $industry = makeAcademicIndustryForEvaluation();

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('evaluation.trainer-questionnaire.store'), [
            'question' => 'Was the trainer knowledgeable?',
            'section' => 'Competence',
            'academic_industry_id' => $industry->id,
            'type' => 'rating',
        ])
        ->assertCreated();

    $question = EvaluationTrainerQuestion::where('question', 'Was the trainer knowledgeable?')->first();

    expect($question)->not->toBeNull()
        ->and($question->section)->toBe('Competence')
        ->and($question->academic_industry_id)->toBe($industry->id)
        ->and($question->status)->toBe('active');
});

test('creating a trainer questionnaire question without an academic industry fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('evaluation.trainer-questionnaire.store'), [
            'question' => 'Was the trainer knowledgeable?',
            'section' => 'Competence',
            'type' => 'rating',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('academic_industry_id');
});

test('a trainer questionnaire question can be archived then restored', function () {
    $industry = makeAcademicIndustryForEvaluation();
    $question = EvaluationTrainerQuestion::create([
        'question' => 'Sample question',
        'section' => 'General',
        'academic_industry_id' => $industry->id,
        'type' => 'rating',
        'status' => 'active',
    ]);

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('evaluation.trainer-questionnaire.archive', $question->id))
        ->assertOk();

    expect($question->fresh()->status)->toBe('inactive');

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('evaluation.trainer-questionnaire.restore', $question->id))
        ->assertOk();

    expect($question->fresh()->status)->toBe('active');
});

test('a trainer questionnaire question still referenced by an evaluation answer cannot be destroyed', function () {
    $industry = makeAcademicIndustryForEvaluation();
    $batch = makeBatch();
    $trainee = makeTrainee(['batch_id' => $batch->id]);
    $trainer = userWithRole('trainer');

    $question = EvaluationTrainerQuestion::create([
        'question' => 'Sample question',
        'section' => 'General',
        'academic_industry_id' => $industry->id,
        'type' => 'rating',
        'status' => 'inactive',
    ]);

    $evaluation = TrainerEvaluation::create([
        'batch_id' => $batch->id,
        'trainee_id' => $trainee->id,
        'trainer_id' => $trainer->id,
        'total_score' => 88,
    ]);

    TrainerEvaluationAnswer::create([
        'evaluation_id' => $evaluation->id,
        'question_id' => $question->id,
        'score' => 4,
    ]);

    $this->actingAs(userWithRole('developer'))
        ->deleteJson(route('evaluation.trainer-questionnaire.destroy', $question->id))
        ->assertStatus(422);

    expect(EvaluationTrainerQuestion::find($question->id))->not->toBeNull();
});
