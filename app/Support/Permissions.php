<?php

namespace App\Support;

class Permissions
{
    /**
     * SETTINGS
     */
    const MANAGE_SETTINGS = 'manage settings';
    /**
     * USER & ROLE MANAGEMENT
     */
    const VIEW_USERS = 'view users';
    const MANAGE_USERS = 'manage users';
    const MANAGE_ROLES = 'manage roles'; 
    /**
     * NAVIGATIONS
     */
    const MANAGE_BATCHES = 'manage batches';
    const MANAGE_TRAINEES = 'manage trainees';
    const MANAGE_ANNOUNCEMENTS = 'manage announcement';
    const MANAGE_LEAVE = 'manage leave';
    const MANAGE_BIOMETRICS = 'manage biometrics';
    const MANAGE_TASKS = 'manage tracks';
    const MANAGE_RATINGS = 'manage ratings';
    const MANAGE_EVALUATION = 'manage evaluation';
    const MANAGE_PAYMENTS = 'manage payments';
    const MANAGE_SCHEDULE = 'manage schedule';
    const MANAGE_SEMINARS = 'manage seminars';
    const MANAGE_CERTIFICATES = 'manage certificates';
    const MANAGE_REPORTS = 'manage reports';
    /**
     * VIEW OWN PAGE TRAINER
     */
    const MANAGE_OWN_SCHEDULE = 'manage own schedule';
    /**
     * VIEW OWN PAGE TRAINEE
     */
    const MANAGE_OWN_TASKS = 'manage own tasks';
    const MANAGE_OWN_LEAVE = 'manage own leave';
    const MANAGE_OWN_EVALUATION = 'manage own evaluation';



    /**
     * Grouped by module — used in seeders, UI permission managers, role builders.
     */
    public static function modules(): array
    {
        return [
            'Settings' => [
                self::MANAGE_SETTINGS,
            ],
            'User & Role Management' => [
                self::VIEW_USERS,
                self::MANAGE_USERS,
                self::MANAGE_ROLES,
            ],
            'Navigations' => [
                self::MANAGE_BATCHES,
                self::MANAGE_TRAINEES,
                self::MANAGE_ANNOUNCEMENTS,
                self::MANAGE_LEAVE,
                self::MANAGE_BIOMETRICS,
                self::MANAGE_TASKS,
                self::MANAGE_RATINGS,
                self::MANAGE_EVALUATION,
                self::MANAGE_PAYMENTS,
                self::MANAGE_SCHEDULE,
                self::MANAGE_SEMINARS,
                self::MANAGE_CERTIFICATES,
                self::MANAGE_REPORTS,
            ], 
        ];
    }

    /**
     * Flat list of all permissions — used for seeding.
     */
    public static function all(): array
    {
        return array_unique(array_merge(...array_values(self::modules())));
    }
}
