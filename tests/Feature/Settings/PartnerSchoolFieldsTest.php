<?php

use App\Models\PartnerSchools;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);

    $this->developer = User::factory()->create();
    $this->developer->assignRole('developer');
});

test('a partner school can be created without contact names', function () {
    $this->actingAs($this->developer)
        ->postJson(route('settings.partner-schools.store'), [
            'status' => 'active',
            'school_name' => 'Nameless Contact College',
            'abbreviation' => 'NCC',
        ])
        ->assertCreated();

    $school = PartnerSchools::where('school_name', 'Nameless Contact College')->sole();

    expect($school->contact_first_name)->toBeNull()
        ->and($school->contact_last_name)->toBeNull();
});

test('link and description are persisted', function () {
    $this->actingAs($this->developer)
        ->postJson(route('settings.partner-schools.store'), [
            'status' => 'active',
            'school_name' => 'Linked University',
            'abbreviation' => 'LU',
            'link' => 'https://linked.edu.ph',
            'description' => 'A partner school with a website.',
        ])
        ->assertCreated();

    $school = PartnerSchools::where('school_name', 'Linked University')->sole();

    expect($school->link)->toBe('https://linked.edu.ph')
        ->and($school->description)->toBe('A partner school with a website.');
});

test('an invalid link is rejected', function () {
    $this->actingAs($this->developer)
        ->postJson(route('settings.partner-schools.store'), [
            'status' => 'active',
            'school_name' => 'Bad Link Academy',
            'abbreviation' => 'BLA',
            'link' => 'not-a-url',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('link');
});

test('an existing contact name can be cleared on update', function () {
    $school = PartnerSchools::create([
        'status' => 'active',
        'school_name' => 'Has Contact Institute',
        'abbreviation' => 'HCI',
        'contact_first_name' => 'Jane',
        'contact_last_name' => 'Doe',
    ]);

    $this->actingAs($this->developer)
        ->putJson(route('settings.partner-schools.update', $school->id), [
            'status' => 'active',
            'school_name' => 'Has Contact Institute',
            'abbreviation' => 'HCI',
            'contact_first_name' => null,
            'contact_last_name' => null,
            'link' => 'https://hci.edu.ph',
        ])
        ->assertOk();

    $school->refresh();

    expect($school->contact_first_name)->toBeNull()
        ->and($school->contact_last_name)->toBeNull()
        ->and($school->link)->toBe('https://hci.edu.ph');
});
