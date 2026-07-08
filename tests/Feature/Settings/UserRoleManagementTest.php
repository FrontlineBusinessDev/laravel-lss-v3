<?php

use App\Models\User;
use Database\Seeders\RoleSeeder;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function userWithRole(string $role): User
{
    $user = User::factory()->create();
    $user->assignRole($role);

    return $user;
}

// ── Access control ───────────────────────────────────────────────────────────

test('developer can list users and roles', function () {
    $developer = userWithRole('developer');

    $this->actingAs($developer)
        ->getJson(route('settings.users.pagination-search'))
        ->assertOk()
        ->assertJsonStructure(['data' => ['data', 'meta']]);

    $this->actingAs($developer)
        ->getJson(route('settings.roles.pagination-search'))
        ->assertOk();
});

test('admin can list users but is forbidden from roles', function () {
    $admin = userWithRole('admin');

    $this->actingAs($admin)
        ->getJson(route('settings.users.pagination-search'))
        ->assertOk();

    $this->actingAs($admin)
        ->getJson(route('settings.roles.pagination-search'))
        ->assertForbidden();
});

test('trainer cannot access the users api', function () {
    $this->actingAs(userWithRole('trainer'))
        ->getJson(route('settings.users.pagination-search'))
        ->assertForbidden();
});

// ── Creator-scoped role matrix ───────────────────────────────────────────────

test('admin cannot assign the developer role', function () {
    $this->actingAs(userWithRole('admin'))
        ->postJson(route('settings.users.store'), [
            'name' => 'New Person',
            'email' => 'new.person@example.com',
            'role' => 'developer',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('role');
});

test('admin cannot create a trainee account', function () {
    $this->actingAs(userWithRole('admin'))
        ->postJson(route('settings.users.store'), [
            'name' => 'Tina Trainee',
            'email' => 'tina@example.com',
            'role' => 'trainee',
        ])
        ->assertStatus(422)
        ->assertJsonValidationErrors('role');
});

test('admin can create a trainer account and the name is split', function () {
    $this->actingAs(userWithRole('admin'))
        ->postJson(route('settings.users.store'), [
            'name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'role' => 'trainer',
        ])
        ->assertCreated();

    $user = User::where('email', 'juan@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->first_name)->toBe('Juan')
        ->and($user->last_name)->toBe('Dela Cruz')
        ->and($user->status)->toBe('active')
        ->and($user->hasRole('trainer'))->toBeTrue();
});

test('developer can create an admin account', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.users.store'), [
            'name' => 'Ada Admin',
            'email' => 'ada@example.com',
            'role' => 'admin',
        ])
        ->assertCreated();

    expect(User::where('email', 'ada@example.com')->first()->hasRole('admin'))
        ->toBeTrue();
});

// ── Archive lifecycle + login block ──────────────────────────────────────────

test('archiving a user sets them inactive', function () {
    $target = userWithRole('trainer');

    $this->actingAs(userWithRole('developer'))
        ->patchJson(route('settings.users.archive', $target->id))
        ->assertOk();

    expect($target->fresh()->status)->toBe('inactive');
});

test('archived users cannot log in', function () {
    $user = User::factory()->create(['status' => 'inactive']);

    $this->post(route('login.store'), [
        'email' => $user->email,
        'password' => '123123qQ!',
    ]);

    $this->assertGuest();
});

test('the last active admin cannot be archived', function () {
    $admin = userWithRole('admin');

    $this->actingAs($admin)
        ->patchJson(route('settings.users.archive', $admin->id))
        ->assertStatus(422);

    expect($admin->fresh()->status)->toBe('active');
});

// ── Roles CRUD ───────────────────────────────────────────────────────────────

test('developer can create a role with permissions', function () {
    $this->actingAs(userWithRole('developer'))
        ->postJson(route('settings.roles.store'), [
            'name' => 'Coordinator',
            'permissions' => ['manage users', 'manage batches'],
        ])
        ->assertCreated();

    $role = Role::where('name', 'Coordinator')->first();

    expect($role)->not->toBeNull()
        ->and($role->hasPermissionTo('manage users'))->toBeTrue()
        ->and($role->hasPermissionTo('manage batches'))->toBeTrue();
});

test('core roles cannot be deleted', function () {
    $adminRole = Role::where('name', 'admin')->first();

    $this->actingAs(userWithRole('developer'))
        ->deleteJson(route('settings.roles.destroy', $adminRole->id))
        ->assertStatus(422);

    expect(Role::where('name', 'admin')->exists())->toBeTrue();
});

test('a role assigned to users cannot be deleted', function () {
    $developer = userWithRole('developer');

    // A custom, deletable role that we then assign to someone.
    $this->actingAs($developer)
        ->postJson(route('settings.roles.store'), ['name' => 'Coordinator', 'permissions' => []])
        ->assertCreated();

    userWithRole('Coordinator');

    $role = Role::where('name', 'Coordinator')->first();

    $this->actingAs($developer)
        ->deleteJson(route('settings.roles.destroy', $role->id))
        ->assertStatus(422);
});

// ── Settings page selection (developer vs admin) ─────────────────────────────

test('developers get the settings shell with the roles module', function () {
    $this->withoutVite();

    $this->actingAs(userWithRole('developer'))
        ->get(route('settings.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('developer/settings/index')
            ->has('permissionModules'));
});

test('admins get the users-only settings shell', function () {
    $this->withoutVite();

    $this->actingAs(userWithRole('admin'))
        ->get(route('settings.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('admin/settings/index'));
});
