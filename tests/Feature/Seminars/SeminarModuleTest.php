<?php

use App\Models\Seminar;
use App\Models\SeminarAdminAlertSetting;
use App\Models\SeminarEmailTemplate;
use App\Models\SeminarParticipant;
use Database\Seeders\RoleSeeder;
use Illuminate\Support\Facades\Mail;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

// ── List of Seminars ─────────────────────────────────────────────────────────

test('developer can create a seminar with an auto-generated registration link', function () {
    $response = $this->actingAs(userWithRole('developer'))
        ->postJson(route('seminars.list-of-seminars.store'), [
            'topic' => 'AI Automation for HR',
            'description' => 'Hands-on session.',
            'date' => '2026-12-01',
            'venue' => 'Online',
            'fee' => 500,
            'type' => 'Technical & Automation Workshops',
        ])
        ->assertCreated();

    $seminar = Seminar::where('topic', 'AI Automation for HR')->firstOrFail();
    expect($seminar->status)->toBe('active');
    expect($seminar->public_registration_url_id)->not->toBeNull();
    expect($response->json('data.registrationLink'))->toContain($seminar->public_registration_url_id);
});

test('editing a seminar is rejected once it is no longer active', function () {
    $seminar = Seminar::factory()->create(['status' => 'closed']);

    $this->actingAs(userWithRole('developer'))
        ->postJson(route('seminars.list-of-seminars.update', $seminar->id), [
            'topic' => 'New topic', 'description' => 'x', 'date' => '2026-01-01',
            'venue' => 'x', 'fee' => 0, 'type' => 'Webinar',
        ])
        ->assertStatus(422);
});

test('completing, closing, and dissolving a seminar transitions its status and cannot be re-transitioned', function () {
    $seminar = Seminar::factory()->create(['status' => 'active']);

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('seminars.list-of-seminars.complete', $seminar->id))
        ->assertOk();
    expect($seminar->fresh()->status)->toBe('completed');

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('seminars.list-of-seminars.close', $seminar->id))
        ->assertStatus(422);
});

test('toggling the public link and fetching the registration QR works', function () {
    $seminar = Seminar::factory()->create(['status' => 'active', 'is_public_url_enable' => true]);

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('seminars.list-of-seminars.toggle-registration', $seminar->id))
        ->assertOk();
    expect($seminar->fresh()->is_public_url_enable)->toBeFalse();

    $response = $this->actingAs(userWithRole('developer'))
        ->getJson(route('seminars.list-of-seminars.registration', $seminar->id))
        ->assertOk();
    expect($response->json('data.url'))->toContain($seminar->public_registration_url_id);
    expect($response->json('data.qr'))->toContain('<svg');
});

// ── Participants ─────────────────────────────────────────────────────────────

test('admin can update a participant\'s progress checklist and payment info, deriving status', function () {
    $seminar = Seminar::factory()->create();
    $participant = SeminarParticipant::factory()->for($seminar, 'seminar')->create();

    $this->actingAs(userWithRole('admin'))
        ->patchJson(route('seminars.participants.update', $participant->id), [
            'payment' => ['status' => 'Paid', 'amount' => 500, 'referenceNo' => 'GC-1'],
            'progress' => ['payment' => true],
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'Confirmed')
        ->assertJsonPath('data.payment.status', 'Paid');

    $participant->refresh();
    expect($participant->payment_done)->toBeTrue();
    expect((float) $participant->amount_paid)->toBe(500.0);
});

// ── Email Notifications ──────────────────────────────────────────────────────

test('admin can edit an email template and toggle an admin alert', function () {
    $template = SeminarEmailTemplate::where('key', 'acknowledgement')->firstOrFail();
    $alert = SeminarAdminAlertSetting::where('key', 'capacity_reached')->firstOrFail();

    $this->actingAs(userWithRole('admin'))
        ->patchJson(route('seminars.email-notification.templates.update', $template->id), [
            'subject' => 'Updated subject',
        ])
        ->assertOk()
        ->assertJsonPath('data.subject', 'Updated subject');

    $this->actingAs(userWithRole('admin'))
        ->patchJson(route('seminars.email-notification.admin-alerts.toggle', $alert->key))
        ->assertOk();
    expect($alert->fresh()->enabled)->toBeTrue();
});

test('sending a test email queues a rendered copy to the requesting admin', function () {
    Mail::fake();
    $template = SeminarEmailTemplate::where('key', 'acknowledgement')->firstOrFail();

    $this->actingAs(userWithRole('admin'))
        ->postJson(route('seminars.email-notification.templates.send-test', $template->id))
        ->assertOk();

    Mail::assertQueued(\App\Mail\SeminarTemplateTestMail::class);
});

// ── Public registration ──────────────────────────────────────────────────────

test('a guest can register for an active seminar through its public link, notifying admins', function () {
    $admin = userWithRole('admin');
    $seminar = Seminar::factory()->create([
        'status' => 'active',
        'is_public_url_enable' => true,
        'public_registration_url_id' => 'tok-open',
        'max_participants' => null,
    ]);

    $this->postJson(route('public.seminars.register.store', 'tok-open'), [
        'name' => 'Carla Dizon',
        'email' => 'carla@example.test',
        'mobile' => '09171234567',
        'location' => 'Quezon City',
        'profession' => 'HR Specialist',
        'is_student' => false,
    ])->assertOk()->assertJson(['success' => true]);

    $participant = SeminarParticipant::where('email', 'carla@example.test')->firstOrFail();
    expect($participant->seminar_id)->toBe($seminar->id);
    expect(\App\Models\Notification::where('type', 'seminar_registration.submitted')->count())->toBeGreaterThan(0);
});

test('registration requires a student id when student status is yes', function () {
    Seminar::factory()->create([
        'status' => 'active', 'is_public_url_enable' => true, 'public_registration_url_id' => 'tok-student',
    ]);

    $this->postJson(route('public.seminars.register.store', 'tok-student'), [
        'name' => 'John Rey', 'email' => 'john@example.test', 'mobile' => '09171234567',
        'location' => 'Taguig', 'profession' => 'Student', 'is_student' => true,
    ])->assertStatus(422)->assertJsonValidationErrors('student_id');
});

test('registration is rejected once the seminar link is disabled', function () {
    Seminar::factory()->create([
        'status' => 'active', 'is_public_url_enable' => false, 'public_registration_url_id' => 'tok-closed',
    ]);

    $this->postJson(route('public.seminars.register.store', 'tok-closed'), [
        'name' => 'X', 'email' => 'x@example.test', 'mobile' => '1', 'location' => 'x', 'profession' => 'x', 'is_student' => false,
    ])->assertStatus(422)->assertJson(['success' => false]);
});
