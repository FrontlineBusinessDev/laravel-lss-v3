<?php

use App\Models\AcademicIndustry;
use App\Models\AcademicLearningOutcomes;
use App\Models\AcademicProgramType;
use App\Models\Batches;
use App\Models\BehavioralEvaluation;
use App\Models\BehavioralQuestion;
use App\Models\PartnerSchools;
use App\Models\Task;
use App\Models\TaskRating;
use App\Models\Trainees;
use App\Support\Statuses;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->actingAs(userWithRole('developer'));
});

// ── carries the row's own created_at/updated_at instead of "now" ──────────────

test('academic import stamps the row created_at/updated_at', function () {
    $this->travelTo(now()->addDay());

    $this->postJson(route('settings.import.academic', 'industry'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'name' => 'Legacy Industry',
            'created_at' => '2022-01-05 10:00:00',
            'updated_at' => '2022-03-01 08:30:00',
        ]],
    ])->assertOk();

    $industry = AcademicIndustry::where('name', 'Legacy Industry')->firstOrFail();
    expect($industry->created_at->toDateTimeString())->toBe('2022-01-05 10:00:00');
    expect($industry->updated_at->toDateTimeString())->toBe('2022-03-01 08:30:00');
});

test('academic import falls back to now() when created_at/updated_at are absent', function () {
    $this->travelTo($now = now());

    $this->postJson(route('settings.import.academic', 'industry'), [
        'file_name' => 'import.csv',
        'rows' => [['name' => 'No Timestamp Industry']],
    ])->assertOk();

    $industry = AcademicIndustry::where('name', 'No Timestamp Industry')->firstOrFail();
    expect($industry->created_at->toDateTimeString())->toBe($now->toDateTimeString());
    expect($industry->updated_at->toDateTimeString())->toBe($now->toDateTimeString());
});

test('academic import creates a new reference row as inactive, but leaves an existing match untouched', function () {
    $existingActive = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'Existing Active Industry']);

    $this->postJson(route('settings.import.academic', 'industry'), [
        'file_name' => 'import.csv',
        'rows' => [
            ['name' => 'Brand New Industry'],
            ['name' => 'Existing Active Industry'],
        ],
    ])->assertOk();

    $created = AcademicIndustry::where('name', 'Brand New Industry')->firstOrFail();
    expect($created->status)->toBe(Statuses::INACTIVE);

    expect($existingActive->fresh()->status)->toBe(Statuses::ACTIVE);
});

test('academic import warns (rather than silently matching) when a row name already exists', function () {
    AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'Duplicate Industry']);

    $response = $this->postJson(route('settings.import.academic', 'industry'), [
        'file_name' => 'import.csv',
        'rows' => [['name' => 'Duplicate Industry']],
    ])->assertOk();

    expect($response->json('data.warnings.0'))->toContain('"Duplicate Industry" already exists');
    expect($response->json('data.errors'))->toBe([]);
    expect(AcademicIndustry::where('name', 'Duplicate Industry')->count())->toBe(1);
});

test('batches import stamps the row created_at/updated_at', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $programType = AcademicProgramType::create(['status' => Statuses::ACTIVE, 'name' => 'OJT']);

    $this->postJson(route('settings.import.batches'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'batch_code' => 'FBS-001',
            'setup' => 'f2f',
            'industry' => $industry->name,
            'program_type' => $programType->name,
            'date_started' => '2022-01-01',
            'is_open' => 0,
            'is_completed' => 1,
            'is_dissolved' => 0,
            'created_at' => '2022-01-01 09:00:00',
            'updated_at' => '2022-06-15 17:45:00',
        ]],
    ])->assertOk();

    $batch = Batches::where('batch_code', 'FBS-001')->firstOrFail();
    expect($batch->created_at->toDateTimeString())->toBe('2022-01-01 09:00:00');
    expect($batch->updated_at->toDateTimeString())->toBe('2022-06-15 17:45:00');
});

test('batches import archives a dissolved batch instead of terminating it', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $programType = AcademicProgramType::create(['status' => Statuses::ACTIVE, 'name' => 'OJT']);

    $this->postJson(route('settings.import.batches'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'batch_code' => 'FBS-DISSOLVED',
            'setup' => 'f2f',
            'industry' => $industry->name,
            'program_type' => $programType->name,
            'date_started' => '2022-01-01',
            'is_open' => 0,
            'is_completed' => 0,
            'is_dissolved' => 1,
        ]],
    ])->assertOk();

    $batch = Batches::where('batch_code', 'FBS-DISSOLVED')->firstOrFail();
    expect($batch->status)->toBe(Statuses::INACTIVE);
});

test('batches import creates a missing industry/program type as inactive instead of rejecting the row', function () {
    $this->postJson(route('settings.import.batches'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'batch_code' => 'FBS-002',
            'setup' => 'f2f',
            'industry' => 'Information and Communication Technologies',
            'program_type' => 'College On-the-Job Training',
            'date_started' => '2022-01-01',
            'is_open' => 1,
        ]],
    ])->assertOk();

    $batch = Batches::where('batch_code', 'FBS-002')->firstOrFail();

    $industry = AcademicIndustry::where('name', 'Information and Communication Technologies')->firstOrFail();
    expect($industry->status)->toBe(Statuses::INACTIVE);
    expect($batch->academic_industry_id)->toBe($industry->id);

    $programType = AcademicProgramType::where('name', 'College On-the-Job Training')->firstOrFail();
    expect($programType->status)->toBe(Statuses::INACTIVE);
    expect($batch->academic_program_type_id)->toBe($programType->id);
});

test('trainees import stamps the row created_at/updated_at', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $programType = AcademicProgramType::create(['status' => Statuses::ACTIVE, 'name' => 'OJT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id, 'academic_program_type_id' => $programType->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Test School']);

    $this->postJson(route('settings.import.trainees'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'first_name' => 'Ada',
            'last_name' => 'Lovelace',
            'email' => 'ada@example.com',
            'batch_code' => $batch->batch_code,
            'school_name' => $school->school_name,
            'gender' => 'female',
            'birthday' => '2000-01-01',
            'required_hours' => 240,
            'created_at' => '2022-07-14 00:00:00',
            'updated_at' => '2023-06-08 15:15:05',
        ]],
    ])->assertOk();

    $trainee = Trainees::where('email', 'ada@example.com')->firstOrFail();
    expect($trainee->created_at->toDateTimeString())->toBe('2022-07-14 00:00:00');
    expect($trainee->updated_at->toDateTimeString())->toBe('2023-06-08 15:15:05');
});

test('trainees import archives a trainee into an already-archived batch even when the row says is_active', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $programType = AcademicProgramType::create(['status' => Statuses::ACTIVE, 'name' => 'OJT']);
    $batch = Batches::factory()->create([
        'status' => Statuses::INACTIVE,
        'academic_industry_id' => $industry->id,
        'academic_program_type_id' => $programType->id,
    ]);

    $this->postJson(route('settings.import.trainees'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'first_name' => 'Stale',
            'last_name' => 'Active',
            'email' => 'stale-active@example.com',
            'batch_code' => $batch->batch_code,
            'birthday' => '',
            'required_hours' => '',
            'is_active' => 1,
        ]],
    ])->assertOk();

    $trainee = Trainees::where('email', 'stale-active@example.com')->firstOrFail();
    expect($trainee->status)->toBe(Statuses::INACTIVE);
});

test('trainees import allows null gender, school, and birthday for incomplete legacy records, defaulting required_hours to 0', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $programType = AcademicProgramType::create(['status' => Statuses::ACTIVE, 'name' => 'OJT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id, 'academic_program_type_id' => $programType->id]);

    $this->postJson(route('settings.import.trainees'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'first_name' => 'Giselle',
            'last_name' => 'Baja',
            'email' => 'giselle@example.com',
            'batch_code' => $batch->batch_code,
            'school_name' => '',
            'gender' => '',
            'birthday' => '',
            'required_hours' => '',
        ]],
    ])->assertOk();

    $trainee = Trainees::where('email', 'giselle@example.com')->firstOrFail();
    expect($trainee->school_id)->toBeNull();
    expect($trainee->gender)->toBeNull();
    expect($trainee->birthday)->toBeNull();
    expect((float) $trainee->required_hours)->toBe(0.0);
});

test('trainees import still rejects a non-blank school name that matches no imported school', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $programType = AcademicProgramType::create(['status' => Statuses::ACTIVE, 'name' => 'OJT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id, 'academic_program_type_id' => $programType->id]);

    $response = $this->postJson(route('settings.import.trainees'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'first_name' => 'Bad',
            'last_name' => 'School',
            'email' => 'badschool@example.com',
            'batch_code' => $batch->batch_code,
            'school_name' => 'Nonexistent School',
            'required_hours' => 240,
        ]],
    ])->assertOk();

    expect($response->json('data.errors.0'))->toContain('school "Nonexistent School" not found');
    expect(Trainees::where('email', 'badschool@example.com')->exists())->toBeFalse();
});

test('payments import stamps the row created_at/updated_at on the guarded TraineesPayments model', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Payer School']);
    $trainee = Trainees::factory()->create(['email' => 'payer@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $this->postJson(route('settings.import.payments'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'payer@example.com',
            'amount_paid' => 3000,
            'payment_date' => '2024-04-02',
            'created_at' => '2024-04-02 11:00:00',
            'updated_at' => '2024-04-02 11:00:00',
        ]],
    ])->assertOk();

    $payment = $trainee->payments()->firstOrFail();
    expect($payment->created_at->toDateTimeString())->toBe('2024-04-02 11:00:00');
    expect($payment->updated_at->toDateTimeString())->toBe('2024-04-02 11:00:00');
});

test('payments import does not treat distinct installments sharing the same generic receipt text as duplicates', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Payer School']);
    $trainee = Trainees::factory()->create(['email' => 'installments@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $response = $this->postJson(route('settings.import.payments'), [
        'file_name' => 'import.csv',
        'rows' => [
            ['trainee_email' => 'installments@example.com', 'amount_paid' => 500, 'payment_date' => '2024-01-09', 'official_receipt_number' => 'Acknowledgement Rece'],
            ['trainee_email' => 'installments@example.com', 'amount_paid' => 1000, 'payment_date' => '2024-01-10', 'official_receipt_number' => 'Acknowledgement Rece'],
            ['trainee_email' => 'installments@example.com', 'amount_paid' => 500, 'payment_date' => '2024-01-09', 'official_receipt_number' => 'Acknowledgement Rece'],
        ],
    ])->assertOk();

    expect($response->json('data.created_count'))->toBe(2);
    expect($response->json('data.errors'))->toHaveCount(1);
    expect($response->json('data.errors.0'))->toContain('duplicate payment');
    expect($trainee->payments()->count())->toBe(2);
});

test('learning outcomes import stamps the pivot created_at/updated_at without the relation overwriting it', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Outcome School']);
    $trainee = Trainees::factory()->create(['email' => 'outcome@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);
    $outcome = AcademicLearningOutcomes::create([
        'status' => Statuses::ACTIVE,
        'learning_outcomes' => 'Apply basic scripting',
        'academic_industry_id' => $industry->id,
    ]);

    $this->postJson(route('settings.import.learning-outcomes'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'outcome@example.com',
            'outcome_text' => 'Apply basic scripting',
            'created_at' => '2022-05-01 08:00:00',
            'updated_at' => '2022-05-01 08:00:00',
        ]],
    ])->assertOk();

    $pivot = DB::table('app_trainees_learning_outcomes')
        ->where('trainee_id', $trainee->id)
        ->where('learning_outcome_id', $outcome->id)
        ->first();
    expect(\Illuminate\Support\Carbon::parse($pivot->created_at)->toDateTimeString())->toBe('2022-05-01 08:00:00');
    expect(\Illuminate\Support\Carbon::parse($pivot->updated_at)->toDateTimeString())->toBe('2022-05-01 08:00:00');
});

test('learning outcomes import creates a missing outcome as inactive, scoped to the trainee batch industry', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'New Outcome School']);
    $trainee = Trainees::factory()->create(['email' => 'newoutcome@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $this->postJson(route('settings.import.learning-outcomes'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'newoutcome@example.com',
            'outcome_text' => 'Never Seen Before Outcome',
            'created_at' => '2022-05-01 08:00:00',
            'updated_at' => '2022-05-01 08:00:00',
        ]],
    ])->assertOk();

    $outcome = AcademicLearningOutcomes::where('learning_outcomes', 'Never Seen Before Outcome')->firstOrFail();
    expect($outcome->status)->toBe(Statuses::INACTIVE);
    expect($outcome->academic_industry_id)->toBe($industry->id);
    expect($outcome->created_at->toDateTimeString())->toBe('2022-05-01 08:00:00');

    $pivot = DB::table('app_trainees_learning_outcomes')
        ->where('trainee_id', $trainee->id)
        ->where('learning_outcome_id', $outcome->id)
        ->first();
    expect($pivot)->not->toBeNull();
    expect($pivot->status)->toBe('active');
});

test('learning outcomes import attaches the same outcome row to trainees from a different industry, since the text is globally unique', function () {
    $ict = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $accounting = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'Accounting']);
    $ictBatch = Batches::factory()->create(['academic_industry_id' => $ict->id]);
    $accountingBatch = Batches::factory()->create(['academic_industry_id' => $accounting->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Shared Text School']);
    $ictTrainee = Trainees::factory()->create(['email' => 'ict-trainee@example.com', 'batch_id' => $ictBatch->id, 'school_id' => $school->id]);
    $accountingTrainee = Trainees::factory()->create(['email' => 'accounting-trainee@example.com', 'batch_id' => $accountingBatch->id, 'school_id' => $school->id]);
    // Pre-existing outcome scoped to ICT — an Accounting trainee's row carrying the
    // same wording must still attach to this one row (the schema forbids a second
    // row with identical text), not be rejected over the industry mismatch.
    $outcome = AcademicLearningOutcomes::create([
        'status' => Statuses::ACTIVE,
        'learning_outcomes' => 'Standard Costing',
        'academic_industry_id' => $ict->id,
    ]);

    $response = $this->postJson(route('settings.import.learning-outcomes'), [
        'file_name' => 'import.csv',
        'rows' => [
            ['trainee_email' => 'ict-trainee@example.com', 'outcome_text' => 'Standard Costing'],
            ['trainee_email' => 'accounting-trainee@example.com', 'outcome_text' => 'Standard Costing'],
        ],
    ])->assertOk();

    expect($response->json('data.errors'))->toBe([]);
    expect(AcademicLearningOutcomes::where('learning_outcomes', 'Standard Costing')->count())->toBe(1);

    expect(DB::table('app_trainees_learning_outcomes')
        ->where('trainee_id', $ictTrainee->id)->where('learning_outcome_id', $outcome->id)->exists())->toBeTrue();
    expect(DB::table('app_trainees_learning_outcomes')
        ->where('trainee_id', $accountingTrainee->id)->where('learning_outcome_id', $outcome->id)->exists())->toBeTrue();
});

test('tasks import stamps Task, TaskRating, and the created_at-only TaskRatingHistory', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Task School']);
    $trainee = Trainees::factory()->create(['email' => 'tasker@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $this->postJson(route('settings.import.tasks'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'tasker@example.com',
            'trainer_email' => 'trainer@example.com',
            'task_title' => 'Legacy Task',
            'date' => '2022-03-21',
            'time_goal' => 3,
            'grade' => 80,
            'is_complete' => 0,
            'created_at' => '2022-03-21 09:00:00',
            'updated_at' => '2022-03-22 10:00:00',
        ]],
    ])->assertOk();

    $task = Task::where('trainee_id', $trainee->id)->where('task', 'Legacy Task')->firstOrFail();
    expect($task->created_at->toDateTimeString())->toBe('2022-03-21 09:00:00');
    expect($task->updated_at->toDateTimeString())->toBe('2022-03-22 10:00:00');

    $rating = TaskRating::where('trainee_id', $trainee->id)->where('task_name', 'Legacy Task')->firstOrFail();
    expect($rating->created_at->toDateTimeString())->toBe('2022-03-21 09:00:00');
    expect($rating->updated_at->toDateTimeString())->toBe('2022-03-22 10:00:00');

    $history = $rating->history()->firstOrFail();
    expect($history->created_at->toDateTimeString())->toBe('2022-03-21 09:00:00');
});

test('tasks import falls back to created_at\'s date when the row\'s date is after it (corrupted legacy export)', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Task School']);
    $trainee = Trainees::factory()->create(['email' => 'baddate@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $response = $this->postJson(route('settings.import.tasks'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'baddate@example.com',
            'task_title' => 'Bad Date Task',
            'date' => '2026-09-09',
            'time_goal' => 3,
            'created_at' => '2024-09-10 07:08:46',
            'updated_at' => '2024-09-10 07:08:46',
        ]],
    ])->assertOk();

    expect($response->json('data.warnings.0'))->toContain('used created_at\'s date instead');

    $task = Task::where('trainee_id', $trainee->id)->where('task', 'Bad Date Task')->firstOrFail();
    expect($task->date->toDateString())->toBe('2024-09-10');
});

test('tasks import clamps an out-of-range grade to 0-100 instead of rejecting the row', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Task School']);
    $trainee = Trainees::factory()->create(['email' => 'overgraded@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $this->postJson(route('settings.import.tasks'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'overgraded@example.com',
            'trainer_email' => 'trainer@example.com',
            'task_title' => 'Over Graded Task',
            'date' => '2022-03-21',
            'time_goal' => 3,
            'grade' => 162,
        ]],
    ])->assertOk();

    $rating = TaskRating::where('trainee_id', $trainee->id)->where('task_name', 'Over Graded Task')->firstOrFail();
    expect($rating->rating)->toBe(100);
});

test('tasks import locks incomplete tasks instead of leaving them open, and keeps completed ones completed', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Task School']);
    $trainee = Trainees::factory()->create(['email' => 'locktest@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $this->postJson(route('settings.import.tasks'), [
        'file_name' => 'import.csv',
        'rows' => [
            ['trainee_email' => 'locktest@example.com', 'task_title' => 'Unfinished Task', 'date' => '2022-03-21', 'time_goal' => 3, 'is_complete' => 0],
            ['trainee_email' => 'locktest@example.com', 'task_title' => 'Finished Task', 'date' => '2022-03-22', 'time_goal' => 3, 'is_complete' => 1],
        ],
    ])->assertOk();

    $unfinished = Task::where('trainee_id', $trainee->id)->where('task', 'Unfinished Task')->firstOrFail();
    expect($unfinished->status)->toBe('locked');
    expect($unfinished->locked_at)->not->toBeNull();

    $finished = Task::where('trainee_id', $trainee->id)->where('task', 'Finished Task')->firstOrFail();
    expect($finished->status)->toBe('completed');
    expect($finished->completed_at)->not->toBeNull();
});

test('tasks import groups repeated (trainee, task, date) rows into one rating instead of dropping later grade updates', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Task School']);
    $trainee = Trainees::factory()->create(['email' => 'progressive@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $response = $this->postJson(route('settings.import.tasks'), [
        'file_name' => 'import.csv',
        'rows' => [
            ['trainee_email' => 'progressive@example.com', 'task_title' => 'React JS', 'date' => '2024-04-29', 'time_goal' => 3],
            ['trainee_email' => 'progressive@example.com', 'task_title' => 'React JS', 'date' => '2024-04-29', 'time_goal' => 3],
            ['trainee_email' => 'progressive@example.com', 'task_title' => 'React JS', 'date' => '2024-04-29', 'time_goal' => 3, 'grade' => 85],
            ['trainee_email' => 'progressive@example.com', 'task_title' => 'React JS', 'date' => '2024-04-29', 'time_goal' => 3, 'grade' => 85],
        ],
    ])->assertOk();

    expect($response->json('data.created_count'))->toBe(2);
    expect($response->json('data.errors'))->toHaveCount(2);
    expect(Task::where('trainee_id', $trainee->id)->where('task', 'React JS')->count())->toBe(1);

    $rating = TaskRating::where('trainee_id', $trainee->id)->where('task_name', 'React JS')->firstOrFail();
    expect($rating->rating)->toBe(85);
    expect($rating->history()->count())->toBe(1);
});

test('tasks import assigns the shared placeholder trainer when trainer_email is blank', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Task School']);
    $trainee = Trainees::factory()->create(['email' => 'notrainer@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $this->postJson(route('settings.import.tasks'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'notrainer@example.com',
            'trainer_email' => '',
            'task_title' => 'No Trainer Task',
            'date' => '2022-03-21',
            'time_goal' => 3,
        ]],
    ])->assertOk();

    $task = Task::where('trainee_id', $trainee->id)->where('task', 'No Trainer Task')->firstOrFail();
    $placeholder = \App\Models\User::where('email', 'unassigned-trainer@import.local')->firstOrFail();
    expect($task->trainer_id)->toBe($placeholder->id);

    // A second row with no trainer reuses the same placeholder account, not a new one each time.
    $this->postJson(route('settings.import.tasks'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'notrainer@example.com',
            'trainer_email' => '',
            'task_title' => 'Second No Trainer Task',
            'date' => '2022-03-22',
            'time_goal' => 2,
        ]],
    ])->assertOk();
    expect(\App\Models\User::where('email', 'unassigned-trainer@import.local')->count())->toBe(1);
});

test('behavioral evaluations import stamps the new evaluation and its answers', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'Eval School']);
    $trainee = Trainees::factory()->create(['email' => 'evaluee@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);
    $question = BehavioralQuestion::create(['question' => 'Reports to work on time', 'section' => 'Attendance', 'is_critical' => false, 'order' => 1]);

    $this->postJson(route('settings.import.behavioral-evaluations'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'evaluee@example.com',
            'trainer_email' => 'trainer@example.com',
            'date' => '2022-01-09',
            'question_text' => 'Reports to work on time',
            'score' => 5,
            'created_at' => '2022-01-09 08:00:00',
            'updated_at' => '2022-01-09 08:00:00',
        ]],
    ])->assertOk();

    $evaluation = BehavioralEvaluation::where('trainee_id', $trainee->id)->firstOrFail();
    expect($evaluation->created_at->toDateTimeString())->toBe('2022-01-09 08:00:00');
    expect($evaluation->updated_at->toDateTimeString())->toBe('2022-01-09 08:00:00');

    $answer = $evaluation->answers()->where('question_id', $question->id)->firstOrFail();
    expect($answer->created_at->toDateTimeString())->toBe('2022-01-09 08:00:00');
});

test('behavioral evaluations import creates a missing question as inactive instead of skipping the answer', function () {
    $industry = AcademicIndustry::create(['status' => Statuses::ACTIVE, 'name' => 'ICT']);
    $batch = Batches::factory()->create(['academic_industry_id' => $industry->id]);
    $school = PartnerSchools::create(['status' => Statuses::ACTIVE, 'school_name' => 'New Question School']);
    $trainee = Trainees::factory()->create(['email' => 'newquestion@example.com', 'batch_id' => $batch->id, 'school_id' => $school->id]);

    $response = $this->postJson(route('settings.import.behavioral-evaluations'), [
        'file_name' => 'import.csv',
        'rows' => [[
            'trainee_email' => 'newquestion@example.com',
            'trainer_email' => 'trainer@example.com',
            'date' => '2022-01-09',
            'question_text' => 'Never Seen Before Question',
            'score' => 4,
        ]],
    ])->assertOk();

    $hasSkipWarning = collect($response->json('data.warnings'))->contains(fn ($w) => str_contains($w, 'no matching question'));
    expect($hasSkipWarning)->toBeFalse();

    $question = BehavioralQuestion::where('question', 'Never Seen Before Question')->firstOrFail();
    expect($question->status)->toBe(Statuses::INACTIVE);
    expect($question->section)->toBe('Imported (Unreviewed)');

    $evaluation = BehavioralEvaluation::where('trainee_id', $trainee->id)->firstOrFail();
    $answer = $evaluation->answers()->where('question_id', $question->id)->firstOrFail();
    expect($answer->score)->toBe(4);
});
