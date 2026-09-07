<?php

use App\Models\TraineeDocument;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function makeDocument(array $overrides = []): TraineeDocument
{
    $trainee = makeTrainee();

    return TraineeDocument::create([
        'status' => 'active',
        'trainee_id' => $trainee->id,
        'document_type' => 'resume',
        'url_link' => 'https://drive.example.com/resume.pdf',
        ...$overrides,
    ]);
}

test('developer can list every document', function () {
    makeDocument();
    makeDocument(['document_type' => 'moa']);

    $this->actingAs(userWithRole('developer'))
        ->getJson(route('documents.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']])
        ->assertJsonCount(2, 'data.data');
});

test('admin can list every document', function () {
    makeDocument();

    $this->actingAs(userWithRole('admin'))
        ->getJson(route('documents.pagination-search'))
        ->assertOk();
});

test('trainer is forbidden from the master documents list', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('documents.pagination-search'))
        ->assertForbidden();
});

test('trainee is forbidden from the master documents list', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('documents.pagination-search'))
        ->assertForbidden();
});

test('filtering by document_type narrows results', function () {
    makeDocument(['document_type' => 'resume']);
    makeDocument(['document_type' => 'moa']);

    $this->actingAs(userWithRole('developer'))
        ->getJson(route('documents.pagination-search', ['filters' => ['document_type' => 'moa']]))
        ->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.document_type', 'moa');
});

test('filtering by trainee_id narrows results to that trainee', function () {
    $doc = makeDocument();
    makeDocument();

    $this->actingAs(userWithRole('developer'))
        ->getJson(route('documents.pagination-search', ['filters' => ['trainee_id' => $doc->trainee_id]]))
        ->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.trainee_id', $doc->trainee_id);
});

test('a url_link-only document resolves its view/download url to the raw link', function () {
    $doc = makeDocument(['url_link' => 'https://drive.example.com/moa.pdf']);

    $response = $this->actingAs(userWithRole('developer'))
        ->getJson(route('documents.pagination-search'))
        ->assertOk();

    $row = collect($response->json('data.data'))->firstWhere('id', $doc->id);

    expect($row['view_url'])->toBe('https://drive.example.com/moa.pdf')
        ->and($row['download_url'])->toBe('https://drive.example.com/moa.pdf')
        ->and($row['file_missing'])->toBeFalse();
});

test('a document row includes the trainee name and batch code', function () {
    $batch = makeBatch();
    $trainee = makeTrainee(['batch_id' => $batch->id, 'first_name' => 'Ada', 'last_name' => 'Lovelace']);
    $doc = TraineeDocument::create([
        'status' => 'active',
        'trainee_id' => $trainee->id,
        'document_type' => 'resume',
        'url_link' => 'https://drive.example.com/ada.pdf',
    ]);

    $response = $this->actingAs(userWithRole('developer'))
        ->getJson(route('documents.pagination-search'))
        ->assertOk();

    $row = collect($response->json('data.data'))->firstWhere('id', $doc->id);

    expect($row['trainee_name'])->toBe('Ada Lovelace')
        ->and($row['batch_code'])->toBe($batch->batch_code);
});
