<?php

use App\Models\PaymentMethod;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── Access control ───────────────────────────────────────────────────────────

test('developer can list payment methods', function () {
    $this->actingAs(userWithRole('developer'))
        ->getJson(route('settings.payment-methods.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('admin can list payment methods', function () {
    $this->actingAs(userWithRole('admin'))
        ->getJson(route('settings.payment-methods.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('trainer cannot list payment methods', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('settings.payment-methods.pagination-search'))
        ->assertForbidden();
});

test('trainee cannot list payment methods', function () {
    $this->actingAs(userWithRole('trainee'))
        ->getJson(route('settings.payment-methods.pagination-search'))
        ->assertForbidden();
});

// ── CRUD ──────────────────────────────────────────────────────────────────────

test('a payment method can be created', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.payment-methods.store'), [
            'status' => 'active',
            'provider_name' => 'GCash',
            'type' => 'E_WALLET',
            'account_name' => 'Test Account',
            'account_number' => '09171234567',
        ])
        ->assertCreated();

    $method = PaymentMethod::where('provider_name', 'GCash')->sole();

    expect($method->type)->toBe('E_WALLET')
        ->and($method->account_number)->toBe('09171234567')
        ->and($method->status)->toBe('active');
});

test('creating a payment method without a provider name fails validation', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.payment-methods.store'), [
            'status' => 'active',
            'type' => 'E_WALLET',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('provider_name');
});

test('a payment method can be archived then restored', function () {
    $developer = userWithRole('developer');
    $method = PaymentMethod::create([
        'status' => 'active',
        'provider_name' => 'Maya',
        'type' => 'E_WALLET',
    ]);

    $this->actingAs($developer)
        ->patchJson(route('settings.payment-methods.archive', $method->id))
        ->assertOk();

    expect($method->fresh()->status)->toBe('inactive');

    $this->actingAs($developer)
        ->patchJson(route('settings.payment-methods.restore', $method->id))
        ->assertOk();

    expect($method->fresh()->status)->toBe('active');
});
