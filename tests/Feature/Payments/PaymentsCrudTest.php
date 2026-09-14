<?php

use App\Models\TraineesPayments;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

/**
 * Payments has no dedicated crudModule() registration and TraineesPayments
 * has no `status` column, so there is no archive/restore lifecycle to test
 * here (unlike Batches/Trainees/Certificates/Announcements). Instead this
 * covers TraineePaymentsController's store/update/delete actions, which sit
 * under the same ungated top-level `auth` group and are enforced by
 * TraineesPolicy::update() (`manage trainees`) against the parent Trainees
 * record. Developer-actor only, per task instructions.
 */
test('developer can record a payment for a trainee', function () {
    $trainee = makeTrainee();

    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('trainees.payments.store', $trainee->id), [
            'amount_paid' => 1500.00,
            'payment_date' => '2026-01-15',
            'reference_no' => 'REF-001',
        ])
        ->assertCreated();

    expect(TraineesPayments::where('id', $response->json('data.id'))->exists())->toBeTrue();
    expect((float) TraineesPayments::find($response->json('data.id'))->amount_paid)->toBe(1500.00);
});

/**
 * The frontend's PaymentTransactionModal always sends a literal `receipt:
 * null` (not an omitted key) when no file is attached — unlike a plain
 * postJson() payload that simply lacks the key. A present-but-null `receipt`
 * survives into $validated (nullable file rule), and since `receipt` isn't a
 * real column, mass-assigning it un-filtered throws MassAssignmentException.
 */
test('recording a payment with an explicit null receipt (no file attached) still succeeds', function () {
    $trainee = makeTrainee();

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('trainees.payments.store', $trainee->id), [
            'amount_paid' => 800.00,
            'payment_date' => '2026-02-01',
            'receipt_link' => 'https://drive.google.com/file/d/example/view',
            'receipt' => null,
        ])
        ->assertCreated()
        ->assertJsonPath('data.receipt_link', 'https://drive.google.com/file/d/example/view');
});

test('recording a payment without an amount fails validation', function () {
    $trainee = makeTrainee();

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('trainees.payments.store', $trainee->id), [
            'payment_date' => '2026-01-15',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('amount_paid');
});

test('developer can update and then delete a trainee payment', function () {
    $trainee = makeTrainee();
    $developer = userWithRole('developer');

    $created = $this->actingAs($developer)
        ->postJson(route('trainees.payments.store', $trainee->id), [
            'amount_paid' => 1000.00,
            'payment_date' => '2026-01-10',
        ])
        ->assertCreated();
    $paymentId = $created->json('data.id');

    // POST, not PATCH — the receipt file can't ride a multipart PATCH body (see routes/web.php).
    $this->actingAs($developer)
        ->postJson(route('trainees.payments.update', [$trainee->id, $paymentId]), [
            'amount_paid' => 2000.00,
            'payment_date' => '2026-01-11',
        ])
        ->assertOk();
    expect((float) TraineesPayments::find($paymentId)->amount_paid)->toBe(2000.00);

    $this->actingAs($developer)
        ->deleteJson(route('trainees.payments.destroy', [$trainee->id, $paymentId]))
        ->assertNoContent();
    expect(TraineesPayments::find($paymentId))->toBeNull();
});
