<?php

use App\Http\Controllers\Settings\SettingController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\UserController;
use App\Http\Controllers\Settings\PartnerSchoolsController;
use App\Http\Controllers\Settings\AcademicController;
use App\Http\Controllers\Settings\AcademicIndustryController;
use App\Http\Controllers\Settings\AcademicLearningOutcomesController;
use App\Http\Controllers\Settings\AcademicLevelController;
use App\Http\Controllers\Settings\AcademicProgramController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Lss\AnnouncementController;
use App\Http\Controllers\Lss\BatchController;
use App\Http\Controllers\Lss\BiometricsController;
use App\Http\Controllers\Lss\CertificateController;
use App\Http\Controllers\Lss\DashboardController;
use App\Http\Controllers\Lss\EvaluationController;
use App\Http\Controllers\Lss\LeaveController;
use App\Http\Controllers\Lss\PaymentController;
use App\Http\Controllers\Lss\RatingController;
use App\Http\Controllers\Lss\ReportController;
use App\Http\Controllers\Lss\ScheduleController;
use App\Http\Controllers\Lss\SeminarController;
use App\Http\Controllers\Lss\TaskController;
use App\Http\Controllers\Lss\TraineeController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;

// Landing dispatcher: guests -> login, authenticated users -> dashboard.
Route::get('/', [HomeController::class, 'index'])->name('home');

// Fortify registers POST /login and POST /logout automatically. The GET
// view is wired in App\Providers\FortifyServiceProvider::configureViews().
Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('login');

// Static pages only (no password-reset backend wired up yet — see
// FortifyServiceProvider / config/fortify.php, only the `login` feature
// is enabled for this build).
Route::middleware('guest')->group(function () {
    Route::inertia('/forgot-password', 'auth/forgot-password')->name('password.request');
    Route::inertia('/reset-password', 'auth/reset-password')->name('password.reset');
});

// ==========================================
// SETTINGS MODULE GROUP
// ==========================================
Route::prefix('settings')->name('settings.')->group(function () {
    // Base /settings page (Redirects to users, or loads a default settings index layout)
    Route::get('/', [SettingController::class, 'index'])->name('index');
    // Users Management
    Route::crudModule('/users', UserController::class, 'users');
    // Roles Management
    Route::crudModule('/roles', RoleController::class, 'roles');
    // Partner School Management
    Route::crudModule('/partner-schools', PartnerSchoolsController::class, 'partner-schools');
    Route::prefix('academic')->name('academic.')->group(function () {
        Route::get('/', [AcademicController::class, 'index'])->name('index');
        Route::crudModule('/industry', AcademicIndustryController::class, 'industry');
        Route::crudModule('/learning-outcomes', AcademicLearningOutcomesController::class, 'learning-outcomes');
        Route::crudModule('/level', AcademicLevelController::class, 'level');
        Route::crudModule('/program', AcademicProgramController::class, 'program');
    });
});

/**
 * Authenticated LSS admin/trainer/trainee modules. Every page below is a
 * static frontend view — the React pages read their data from
 * resources/js/data/mockData.ts rather than from these controllers.
 * No role/permission middleware yet, per current project scope: only
 * `auth` is enforced.
 */
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/batches', [BatchController::class, 'index'])->name('batches.index');
    Route::get('/batches/{id}', [BatchController::class, 'show'])->name('batches.show');

    Route::get('/trainees', [TraineeController::class, 'index'])->name('trainees.index');
    Route::get('/trainees/{id}', [TraineeController::class, 'show'])->name('trainees.show');

    Route::get('/announcements', [AnnouncementController::class, 'index'])->name('announcements.index');
    Route::get('/leave', [LeaveController::class, 'index'])->name('leave.index');
    Route::get('/biometrics', [BiometricsController::class, 'index'])->name('biometrics.index');
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::get('/ratings', [RatingController::class, 'index'])->name('ratings.index');
    Route::get('/evaluation', [EvaluationController::class, 'index'])->name('evaluation.index');
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::get('/seminars', [SeminarController::class, 'index'])->name('seminars.index');
    Route::get('/certificates', [CertificateController::class, 'index'])->name('certificates.index');
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    // Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');

    // Users & Roles admin JSON API consumed by the settings DataTableField.
    // Coarse access is gated by the Spatie permission; UserController layers on
    // the creator-scoped role matrix, and RolesController is developer-only.
    Route::middleware('permission:manage users')->group(function () {
        Route::crudModule('/settings/users', UserController::class, 'settings.users');
    });
    Route::middleware('permission:manage roles')->group(function () {
        Route::crudModule('/settings/roles', RoleController::class, 'settings.roles');
    });
});
