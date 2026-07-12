<?php

use App\Models\AcademicProgram;
use App\Models\AppLogger;
use App\Models\User;
use Spatie\Permission\Models\Role;

/**
 * The developer-only audit trail: role gating, automatic model logging with an
 * actor snapshot + diff, visit logging, and the critical constraint that a log
 * entry outlives the user it references (no restrictive FK).
 */
function makeLogUser(string $role): User
{
    Role::findOrCreate($role, 'web');

    $user = User::create([
        'first_name' => ucfirst($role),
        'last_name' => 'Tester',
        'email' => $role.'@example.test',
        'password' => 'x-not-used-in-tests',
        'status' => 'active',
    ]);
    $user->assignRole($role);

    return $user;
}

test('developer can view the system log page and feed', function () {
    $this->actingAs(makeLogUser('developer'));

    $this->get(route('system-log.index'))->assertOk();
    // BaseController wraps the paginator in sendResponse: { data: { data, meta } }.
    $this->getJson(route('system-log.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);
});

test('non-developer is forbidden from the system log', function () {
    $this->actingAs(makeLogUser('admin'));

    $this->get(route('system-log.index'))->assertForbidden();
    $this->getJson(route('system-log.pagination-search'))->assertForbidden();
});

test('model changes are logged with actor snapshot and old/new diff', function () {
    $dev = makeLogUser('developer');
    $this->actingAs($dev);

    $program = AcademicProgram::create([
        'status' => 'active',
        'name' => 'LOG-TEST',
        'course_name' => 'Logging 101',
    ]);
    $program->update(['course_name' => 'Logging 102']);
    $program->update(['status' => 'inactive']); // archive

    $actions = AppLogger::where('loggable_type', AcademicProgram::class)
        ->orderBy('id')->pluck('action')->all();
    expect($actions)->toBe(['create', 'update', 'archive']);

    $archive = AppLogger::where('action', 'archive')->latest('id')->first();
    expect($archive->actor['email'])->toBe($dev->email);
    expect($archive->changes['old']['status'])->toBe('active');
    expect($archive->changes['new']['status'])->toBe('inactive');
});

test('authenticated page visits are logged', function () {
    $this->actingAs(makeLogUser('developer'));

    $this->get(route('dashboard'))->assertOk();

    expect(AppLogger::where('action', 'visit')->exists())->toBeTrue();
});

test('a log entry survives deletion of the acting user (no FK block)', function () {
    $dev = makeLogUser('developer');
    $this->actingAs($dev);

    AcademicProgram::create([
        'status' => 'active',
        'name' => 'KEEP-LOG',
        'course_name' => 'Retention',
    ]);

    $logId = AppLogger::where('subject_label', 'KEEP-LOG')->value('id');
    expect($logId)->not->toBeNull();

    // Deleting the actor must neither cascade to nor block the audit row.
    $dev->delete();

    $log = AppLogger::find($logId);
    expect($log)->not->toBeNull();
    expect($log->actor['email'])->toBe($dev->email);
});
