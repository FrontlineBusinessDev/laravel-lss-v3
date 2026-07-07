<?php

namespace Database\Seeders;

use App\Support\Permissions;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleSeeder extends Seeder
{
    /**
     * This build only needs 3 roles for the LSS admin/trainer/trainee
     * portal. No granular permissions yet — role checks (Auth::user()
     * ->hasRole()) are enough while the frontend is static.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $trainerPermissions = [
            Permissions::MANAGE_BATCHES,
            Permissions::MANAGE_TRAINEES,
            Permissions::MANAGE_TASKS,
            Permissions::MANAGE_OWN_SCHEDULE,
            Permissions::MANAGE_RATINGS,
        ];
        $traineePermissions = [
            Permissions::MANAGE_OWN_TASKS,
            Permissions::MANAGE_OWN_LEAVE,
            Permissions::MANAGE_OWN_EVALUATION,
        ];

        // Every permission referenced below must exist before syncPermissions()
        // — Spatie throws PermissionDoesNotExist otherwise.
        $everyPermission = array_unique(array_merge(
            Permissions::all(),
            $trainerPermissions,
            $traineePermissions,
        ));
        foreach ($everyPermission as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // ── Developer — full system access, including role management ──────────
        Role::firstOrCreate(['name' => 'developer'])
            ->syncPermissions(Permissions::all());

        // ── Admin — everything except managing roles ──────────────────────────
        Role::firstOrCreate(['name' => 'admin'])
            ->syncPermissions(array_values(
                array_diff(Permissions::all(), [Permissions::MANAGE_ROLES]),
            ));

        // ── Trainer — batch/trainee/task facing ───────────────────────────────
        Role::firstOrCreate(['name' => 'trainer'])
            ->syncPermissions($trainerPermissions);

        // ── Trainee — own-record access only ──────────────────────────────────
        Role::firstOrCreate(['name' => 'trainee'])
            ->syncPermissions($traineePermissions);
    }
}
