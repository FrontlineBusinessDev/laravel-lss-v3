<?php

use App\Http\Controllers\Auth\AccountSetupController;
use App\Http\Controllers\Batches\BatchesController;
use App\Http\Controllers\Batches\BatchTraineesController;
use App\Http\Controllers\Batches\BatchViewController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\Lss\AnnouncementController;
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
// use App\Http\Controllers\Lss\BatchController;
use App\Http\Controllers\Lss\TaskController;
use App\Http\Controllers\Lss\TraineeController;
use App\Http\Controllers\PublicRegistrationController;
use App\Http\Controllers\Settings\AcademicController;
use App\Http\Controllers\Settings\AcademicIndustryController;
use App\Http\Controllers\Settings\AcademicLearningOutcomesController;
use App\Http\Controllers\Settings\AcademicLevelController;
use App\Http\Controllers\Settings\AcademicProgramController;
use App\Http\Controllers\Settings\PartnerSchoolsController;
use App\Http\Controllers\Settings\RoleController;
use App\Http\Controllers\Settings\SettingController;
use App\Http\Controllers\Settings\UserController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Http\Controllers\AuthenticatedSessionController;

// Landing dispatcher: guests -> login, authenticated users -> dashboard.
Route::get('/', [HomeController::class, 'index'])->name('home');

// Fortify registers POST /login and POST /logout automatically. The GET
// view is wired in App\Providers\FortifyServiceProvider::configureViews().
Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->middleware('guest')
    ->name('login');

// Public batch registration. Resolved by a batch's system-generated
// public_registration_url_id (the QR/shareable link target). Guest-accessible;
// GET renders the form, POST persists the trainee + documents.
Route::get('/register/{token}', [PublicRegistrationController::class, 'show'])->name('public.register');
Route::post('/register/{token}', [PublicRegistrationController::class, 'store'])->name('public.register.store');
// First-party QR image for the batch's public link — used as the register
// page's og:image / twitter:image (an absolute, guest-reachable URL).
Route::get('/register/{token}/qr', [PublicRegistrationController::class, 'qr'])->name('public.register.qr');

// Static pages only (no password-reset backend wired up yet — see
// FortifyServiceProvider / config/fortify.php, only the `login` feature
// is enabled for this build).
Route::middleware('guest')->group(function () {
    Route::inertia('/forgot-password', 'auth/forgot-password')->name('password.request');
    Route::inertia('/reset-password', 'auth/reset-password')->name('password.reset');

    // Admin-triggered password reset / first-time account setup completion. The
    // emailed link (App\Support\PasswordSetupUrl) lands here with a single-use
    // broker token; GET renders the set-password page, POST persists it.
    Route::get('/invitation/{token}', [AccountSetupController::class, 'edit'])->name('password.setup');
    Route::post('/invitation/{token}', [AccountSetupController::class, 'update'])->name('password.setup.store');
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
    // Batches CRUD (index/pagination-search/lookup/store/update/archive/restore/destroy)
    // plus the Terminate transition and the QR/registration-link endpoint.
    Route::crudModule('/batches', BatchesController::class, 'batches');
    Route::patch('/batches/{id}/terminate', [BatchesController::class, 'terminate'])->name('batches.terminate');
    Route::get('/batches/{id}/registration', [BatchesController::class, 'registration'])->name('batches.registration');
    // Batch-scoped trainee listing consumed by the detail page's DataTableField
    // (static `/trainees/pagination-search` segment, so no clash with `{id}`).
    Route::get('/batches/{batch}/trainees/pagination-search', [BatchTraineesController::class, 'paginationSearch'])
        ->name('batches.trainees.pagination-search');
    // Batch detail page + tab sub-routes — real Inertia routes mirroring the
    // settings module; each tab maps to its own controller handler.
    Route::get('/batches/{id}', [BatchViewController::class, 'trainees'])->name('batches.show');
    Route::get('/batches/{id}/activity-log', [BatchViewController::class, 'activityLog'])->name('batches.activity-log');
    Route::get('/batches/{id}/financial', [BatchViewController::class, 'financial'])->name('batches.financial');
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
        // Admin "Send password reset" action: queues the invite/reset email.
        Route::post('/settings/users/{id}/reset-password', [UserController::class, 'sendPasswordReset'])
            ->name('settings.users.reset-password');
    });
    Route::middleware('permission:manage roles')->group(function () {
        Route::crudModule('/settings/roles', RoleController::class, 'settings.roles');
    });
});
