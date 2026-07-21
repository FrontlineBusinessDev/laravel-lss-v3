<?php

use App\Http\Controllers\v1\HomeController;
use App\Http\Controllers\v1\Developer\Settings\AcademicController;
use App\Http\Controllers\v1\Developer\Settings\AcademicIndustryController;
use App\Http\Controllers\v1\Developer\Settings\AcademicLearningOutcomesController;
use App\Http\Controllers\v1\Developer\Settings\AcademicLevelController;
use App\Http\Controllers\v1\Developer\Settings\AcademicProgramController;
use App\Http\Controllers\v1\Developer\Settings\GroupDiscountController;
use App\Http\Controllers\v1\Developer\Settings\HoursDiscountController;
use App\Http\Controllers\v1\Developer\Settings\LeaveCategoryController;
use App\Http\Controllers\v1\Developer\Settings\PartnerSchoolsController;
use App\Http\Controllers\v1\Developer\Settings\PaymentMethodsController;
use App\Http\Controllers\v1\Developer\Settings\RatesController;
use App\Http\Controllers\v1\Developer\Settings\RoleController;
use App\Http\Controllers\v1\Developer\Settings\SettingController;
use App\Http\Controllers\v1\Developer\Settings\UserController;
use App\Http\Controllers\v1\Developer\Announcement\AnnoucementController;
use App\Http\Controllers\v1\Developer\Auth\AccountSetupController;
use App\Http\Controllers\v1\Developer\Auth\ChangePasswordController;
use App\Http\Controllers\v1\Developer\Auth\ForgotPasswordController;
use App\Http\Controllers\v1\Developer\Batches\BatchesController;
use App\Http\Controllers\v1\Developer\Batches\BatchTraineesController;
use App\Http\Controllers\v1\Developer\Batches\BatchViewController;
use App\Http\Controllers\v1\Developer\Developer\SystemLogController;
use App\Http\Controllers\v1\Developer\Biometrics\BiometricsController;
use App\Http\Controllers\v1\Developer\Certificate\CitationController;
use App\Http\Controllers\v1\Developer\Certificate\CertificateTemplateController;
use App\Http\Controllers\v1\Developer\Certificate\SeminarCertificateController;
use App\Http\Controllers\v1\Developer\Certificate\TraineeCertificateController;
use App\Http\Controllers\v1\Developer\Dashboard\DashboardController;
use App\Http\Controllers\v1\Developer\Evaluation\EvaluationSeminarQuestionnaire;
use App\Http\Controllers\v1\Developer\Evaluation\EvaluationTrainerQuestionnaire;
use App\Http\Controllers\v1\Developer\Evaluation\EvaluationViewController;
use App\Http\Controllers\v1\Developer\Leave\LeaveController;
use App\Http\Controllers\v1\Developer\Leave\LeaveRequestController;
use App\Http\Controllers\v1\NotificationController;
use App\Http\Controllers\v1\Trainer\Leave\LeaveController as TrainerLeaveController;
use App\Http\Controllers\v1\Developer\Payment\PaymentController;
use App\Http\Controllers\v1\Developer\Report\ReportController;
use App\Http\Controllers\v1\Developer\Schedule\ScheduleController;
use App\Http\Controllers\v1\Developer\Seminar\SeminarController;
use App\Http\Controllers\v1\Developer\Tasks\DailyTaskController;
use App\Http\Controllers\v1\Developer\Tasks\TasksController;
use App\Http\Controllers\v1\Developer\Ratings\TaskRatingController;
use App\Http\Controllers\v1\Developer\Ratings\BehavioralEvaluationController;
use App\Http\Controllers\v1\Developer\Ratings\BehavioralQuestionController;
use App\Http\Controllers\v1\Developer\Seminar\SeminarEmailNotificationController;
use App\Http\Controllers\v1\Developer\Seminar\SeminarListController;
use App\Http\Controllers\v1\Developer\Seminar\SeminarParticipantsController;
use App\Http\Controllers\v1\Developer\Trainees\TraineeBiometricsController as TraineeDetailBiometricsController;
use App\Http\Controllers\v1\Developer\Trainees\TraineeDocumentsController;
use App\Http\Controllers\v1\Developer\Trainees\TraineesController;
use App\Http\Controllers\v1\Developer\Trainees\TraineePaymentsController;
use App\Http\Controllers\v1\Developer\Trainees\TraineesViewController;
use App\Http\Controllers\v1\Trainer\Announcements\AnnouncementsController as TrainerAnnouncementsController;
use App\Http\Controllers\v1\Trainer\Batches\BatchesController as TrainerBatchesController;
use App\Http\Controllers\v1\Trainer\Batches\BatchTraineesController as TrainerBatchTraineesController;
use App\Http\Controllers\v1\Trainer\Batches\BatchViewController as TrainerBatchViewController;
use App\Http\Controllers\v1\Trainer\Dashboard\DashboardController as TrainerDashboardController;
use App\Http\Controllers\v1\Trainer\Evaluations\EvaluationsController as TrainerEvaluationsController;
use App\Http\Controllers\v1\Trainer\Ratings\RatingsController as TrainerRatingsController;
use App\Http\Controllers\v1\Trainer\Schedule\ScheduleController as TrainerScheduleController;
use App\Http\Controllers\v1\Trainer\Tasks\TasksController as TrainerTasksController;
use App\Http\Controllers\v1\Trainer\Trainees\TraineeDocumentsController as TrainerTraineeDocumentsController;
use App\Http\Controllers\v1\Trainer\Trainees\TraineesController as TrainerTraineesController;
use App\Http\Controllers\v1\Trainer\Trainees\TraineesViewController as TrainerTraineesViewController;
use App\Http\Controllers\v1\Trainee\Announcements\AnnouncementsController as TraineeAnnouncementsController;
use App\Http\Controllers\v1\Trainee\Biometrics\BiometricsController as TraineeBiometricsController;
use App\Http\Controllers\v1\Trainee\Dashboard\DashboardController as TraineeDashboardController;
use App\Http\Controllers\v1\Trainee\Evaluations\EvaluationsController as TraineeEvaluationsController;
use App\Http\Controllers\v1\Trainee\Leave\LeaveController as TraineeLeaveController;
use App\Http\Controllers\v1\Trainee\MyInfo\MyInfoController as TraineeMyInfoController;
use App\Http\Controllers\v1\Trainee\Payments\PaymentsController as TraineeSelfPaymentsController;
use App\Http\Controllers\v1\Trainee\Ratings\RatingsController as TraineeRatingsController;
use App\Http\Controllers\v1\Trainee\Tasks\TasksController as TraineeTasksController;
use App\Http\Controllers\v1\PublicRegistrationController;
use App\Support\Permissions;
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
// page's og:image / twitter:image (an absolute, guest-reachable URL). Answers
// HEAD as well as GET: some social scrapers issue a HEAD to validate the image
// (content-type/length) before fetching it, and a HEAD-less route 405s them.
Route::match(['get', 'head'], '/register/{token}/qr', [PublicRegistrationController::class, 'qr'])->name('public.register.qr');

Route::middleware('guest')->group(function () {
    Route::inertia('/forgot-password', 'auth/forgot-password')->name('password.request');
    // Public "forgot password" — mints a broker token and emails a reset link
    // via the same /invitation/{token} completion route the admin-invite flow
    // uses (no Fortify resetPasswords feature needed — see ForgotPasswordController).
    Route::post('/forgot-password', [ForgotPasswordController::class, 'send'])->name('password.email');

    // Admin-triggered password reset / first-time account setup completion. The
    // emailed link (App\Support\PasswordSetupUrl / PasswordResetUrl) lands here
    // with a single-use broker token; GET renders the set-password page, POST
    // persists it. Shared by both the admin-invite and forgot-password flows.
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
    // Payment Method Management
    Route::crudModule('/payment-methods', PaymentMethodsController::class, 'payment-methods');
    // Leave category limits (max days / instances per category), enforced by
    // LeaveRequestController on submission.
    Route::crudModule('/leave-categories', LeaveCategoryController::class, 'leave-categories');
    Route::prefix('academic')->name('academic.')->group(function () {
        Route::get('/', [AcademicController::class, 'index'])->name('index');
        Route::crudModule('/industry', AcademicIndustryController::class, 'industry');
        Route::crudModule('/learning-outcomes', AcademicLearningOutcomesController::class, 'learning-outcomes');
        Route::crudModule('/level', AcademicLevelController::class, 'level');
        Route::crudModule('/program', AcademicProgramController::class, 'program');
    });
    // Rates & discount matrices: its own top-level Settings section (sibling
    // to Academic/Users/Partner Schools), with a "Default Rates" landing page
    // plus 2 further sub-pages.
    Route::prefix('rates')->name('rates.')->group(function () {
        Route::get('/', [RatesController::class, 'index'])->name('default.index');
        Route::put('/', [RatesController::class, 'updateRates'])->name('default.update');
        // No status column on these two tables, so no archive/restore routes.
        Route::prefix('hours-discounts')->name('hours-discounts.')->group(function () {
            Route::get('/', [HoursDiscountController::class, 'index'])->name('index');
            Route::get('/pagination-search', [HoursDiscountController::class, 'paginationSearch'])->name('pagination-search');
            Route::post('/', [HoursDiscountController::class, 'store'])->name('store');
            Route::post('/{id}', [HoursDiscountController::class, 'update'])->name('update');
            Route::delete('/{id}', [HoursDiscountController::class, 'destroy'])->name('destroy');
        });
        Route::prefix('group-discounts')->name('group-discounts.')->group(function () {
            Route::get('/', [GroupDiscountController::class, 'index'])->name('index');
            Route::get('/pagination-search', [GroupDiscountController::class, 'paginationSearch'])->name('pagination-search');
            Route::post('/', [GroupDiscountController::class, 'store'])->name('store');
            Route::post('/{id}', [GroupDiscountController::class, 'update'])->name('update');
            Route::delete('/{id}', [GroupDiscountController::class, 'destroy'])->name('destroy');
        });
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
    // Dashboard widgets self-fetch client-side (see
    // resources/js/api-service-layer/admin/dashboard.ts) rather than via
    // Inertia props — unscoped versions of the trainer dashboard's endpoints.
    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics'])->name('dashboard.metrics');
    Route::get('/dashboard/upcoming-ends', [DashboardController::class, 'upcomingEnds'])->name('dashboard.upcoming-ends');
    Route::get('/dashboard/calendar-events', [DashboardController::class, 'calendarEvents'])->name('dashboard.calendar-events');
    Route::get('/dashboard/on-leave', [DashboardController::class, 'onLeave'])->name('dashboard.on-leave');
    Route::get('/dashboard/ongoing-tasks', [DashboardController::class, 'ongoingTasks'])->name('dashboard.ongoing-tasks');
    Route::get('/dashboard/announcements', [DashboardController::class, 'announcements'])->name('dashboard.announcements');
    Route::get('/dashboard/document-compliance', [DashboardController::class, 'documentCompliance'])->name('dashboard.document-compliance');
    Route::get('/dashboard/trainee-growth', [DashboardController::class, 'traineeGrowth'])->name('dashboard.trainee-growth');
    Route::get('/dashboard/status-breakdown', [DashboardController::class, 'traineeStatusBreakdown'])->name('dashboard.status-breakdown');
    Route::get('/dashboard/recent-batches', [DashboardController::class, 'recentBatches'])->name('dashboard.recent-batches');
    // Self-service change password (avatar menu, any authenticated user).
    Route::put('/user/password', [ChangePasswordController::class, 'update'])->name('user.password.update');
    // Polled in-app notification feed (TopBar/NotificationBell) — own rows only.
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
    // Batches CRUD (index/pagination-search/lookup/store/update/archive/restore/destroy)
    // plus the Terminate transition and the QR/registration-link endpoint.
    Route::crudModule('/batches', BatchesController::class, 'batches');
    Route::patch('/batches/{id}/terminate', [BatchesController::class, 'terminate'])->name('batches.terminate');
    Route::patch('/batches/{id}/toggle-registration', [BatchesController::class, 'toggleRegistration'])->name('batches.toggle-registration');
    Route::get('/batches/{id}/registration', [BatchesController::class, 'registration'])->name('batches.registration');
    Route::get('/batches/trainer-options', [BatchesController::class, 'trainerOptions'])->name('batches.trainer-options');
    Route::patch('/batches/{id}/trainers', [BatchesController::class, 'assignTrainers'])->name('batches.assign-trainers');
    // Batch-scoped trainee listing consumed by the detail page's DataTableField
    // (static `/trainees/pagination-search` segment, so no clash with `{id}`).
    Route::get('/batches/{batch}/trainees/pagination-search', [BatchTraineesController::class, 'paginationSearch'])
        ->name('batches.trainees.pagination-search');
    // Batch detail page + tab sub-routes — real Inertia routes mirroring the
    // settings module; each tab maps to its own controller handler.
    Route::get('/batches/{id}', [BatchViewController::class, 'trainees'])->name('batches.show');
    Route::get('/batches/{id}/activity-log', [BatchViewController::class, 'activityLog'])->name('batches.activity-log');
    Route::get('/batches/{id}/financial', [BatchViewController::class, 'financial'])->name('batches.financial');
    Route::get('/batches/{id}/trainers', [BatchViewController::class, 'trainersTab'])->name('batches.trainers');
    // Registered before the show/tab routes below so crudModule's static
    // segments (pagination-search, search-active, lookup) win the route
    // match against the `{id}` wildcard used by the tab views.
    Route::crudModule('/trainees', TraineesController::class, 'trainees');
    // Same static-segment-before-wildcard rule as above — backs the
    // Evaluation module's AccessOverridePanel bypass toggle.
    Route::middleware('permission:' . Permissions::MANAGE_EVALUATION)->group(function () {
        Route::get('/trainees/evaluation-override-candidates', [TraineesController::class, 'evaluationOverrideCandidates'])->name('trainees.evaluation-override-candidates');
        Route::patch('/trainees/{id}/evaluation-override', [TraineesController::class, 'toggleEvaluationOverride'])->name('trainees.evaluation-override.update');
    });
    Route::get('/trainees/{id}', [TraineesViewController::class, 'personalInformationTab'])->name('trainees.personalInformationTab');
    Route::get('/trainees/{id}/academic-information', [TraineesViewController::class, 'academicInfoTab'])->name('trainees.academicInfoTab');
    Route::get('/trainees/{id}/documents', [TraineesViewController::class, 'documents'])->name('trainees.documents');
    Route::post('/trainees/{id}/documents', [TraineeDocumentsController::class, 'uploadDocument'])->name('trainees.documents.store');
    Route::delete('/trainees/{id}/documents/{documentId}', [TraineeDocumentsController::class, 'deleteDocument'])->name('trainees.documents.destroy');
    Route::get('/trainees/{id}/learning-outcomes', [TraineesViewController::class, 'learningOutcomes'])->name('trainees.learningOutcomes');
    Route::patch('/trainees/{id}/learning-outcomes/{outcomeId}', [TraineesController::class, 'updateLearningOutcomeStatus'])->name('trainees.learningOutcomes.updateStatus')->middleware('throttle:500,1');
    Route::post('/trainees/{id}/avatar', [TraineesController::class, 'updateAvatar'])->name('trainees.updateAvatar');
    Route::delete('/trainees/{id}/avatar', [TraineesController::class, 'destroyAvatar'])->name('trainees.destroyAvatar');
    Route::get('/trainees/{id}/payment-details', [TraineesViewController::class, 'paymentDetails'])->name('trainees.paymentDetails');
    Route::post('/trainees/{id}/payments', [TraineePaymentsController::class, 'storePayment'])->name('trainees.payments.store');
    Route::patch('/trainees/{id}/payments/{paymentId}', [TraineePaymentsController::class, 'updatePayment'])->name('trainees.payments.update');
    Route::delete('/trainees/{id}/payments/{paymentId}', [TraineePaymentsController::class, 'deletePayment'])->name('trainees.payments.destroy');
    Route::patch('/trainees/{id}/billing-overrides', [TraineesController::class, 'updateBillingOverrides'])->name('trainees.updateBillingOverrides');
    Route::patch('/trainees/{id}/link-account', [TraineesController::class, 'linkAccount'])->name('trainees.linkAccount');
    Route::patch('/trainees/{id}/unlink-account', [TraineesController::class, 'unlinkAccount'])->name('trainees.unlinkAccount');
    Route::post('/trainees/{id}/approve', [TraineesController::class, 'approve'])->name('trainees.approve');
    Route::post('/trainees/{id}/decline', [TraineesController::class, 'decline'])->name('trainees.decline');
    Route::get('/trainees/{id}/ratings', [TraineesViewController::class, 'ratings'])->name('trainees.ratings');
    Route::get('/trainees/{id}/certificate', [TraineesViewController::class, 'certificate'])->name('trainees.certificate');
    Route::get('/trainees/{id}/biometrics', [TraineesViewController::class, 'biometrics'])->name('trainees.biometrics');
    Route::get('/trainees/{id}/biometrics-data', [TraineeDetailBiometricsController::class, 'records'])->name('trainees.biometrics.data');
    // Announcements CSR shell + JSON API both come from AnnoucementController
    // via the crudModule() registration further down (keeps a single source
    // of truth for the route name `announcements.index`).

    // Developer/admin leave management page shell. The JSON API underneath
    // (LeaveRequestController) is shared with the trainer/trainee pages —
    // access to *rows* is enforced by LeaveRequestPolicy + newQuery() role
    // scoping, not by gating this route (matches every other module here).
    Route::get('/leave', [LeaveController::class, 'index'])->name('leave.index');
    Route::prefix('leave')->name('leave.')->group(function () {
        Route::get('/pagination-search', [LeaveRequestController::class, 'paginationSearch'])->name('pagination-search');
        Route::post('/', [LeaveRequestController::class, 'store'])->name('store');
        Route::patch('/{id}/approve', [LeaveRequestController::class, 'approve'])->name('approve');
        Route::patch('/{id}/decline', [LeaveRequestController::class, 'decline'])->name('decline');
        Route::delete('/{id}', [LeaveRequestController::class, 'destroy'])->name('destroy');
    });
    Route::get('/biometrics', [BiometricsController::class, 'index'])->name('biometrics.index');
    Route::get('/biometrics/records', [BiometricsController::class, 'records'])->name('biometrics.records');
    Route::get('/biometrics/imports', [BiometricsController::class, 'imports'])->name('biometrics.imports');
    Route::post('/biometrics/import', [BiometricsController::class, 'import'])->name('biometrics.import');
    Route::patch('/biometrics/records/{id}', [BiometricsController::class, 'updateRecord'])->name('biometrics.records.update');
    Route::delete('/biometrics/records/{id}', [BiometricsController::class, 'deleteRecord'])->name('biometrics.records.destroy');

    // Tasks module — Task Management (default) + Daily Task Sheet, real DB-backed.
    Route::middleware('permission:' . Permissions::MANAGE_TASKS)->group(function () {
        Route::prefix('tasks')->name('tasks.')->group(function () {
            Route::get('/', [TasksController::class, 'index'])->name('index');
            Route::get('/pagination-search', [TasksController::class, 'paginationSearch'])->name('pagination-search');
            Route::get('/trainers', [TasksController::class, 'trainers'])->name('trainers');
            Route::post('/', [TasksController::class, 'store'])->name('store');
            Route::post('/{id}', [TasksController::class, 'update'])->name('update');
            Route::patch('/{id}/complete', [TasksController::class, 'completeAction'])->name('complete');
            Route::patch('/{id}/lock', [TasksController::class, 'lockAction'])->name('lock');
            Route::patch('/{id}/remarks', [TasksController::class, 'updateRemarks'])->name('remarks');
            Route::patch('/{id}/time-spent', [TasksController::class, 'updateTimeSpent'])->name('time-spent');
            Route::delete('/{id}', [TasksController::class, 'destroy'])->name('destroy');
            Route::prefix('daily-task')->name('daily-task.')->group(function () {
                Route::get('/', [DailyTaskController::class, 'index'])->name('index');
                Route::get('/list', [DailyTaskController::class, 'list'])->name('list');
                Route::get('/pagination-search', [DailyTaskController::class, 'paginationSearch'])->name('pagination-search');
            });
        });
    });

    // Ratings module — RatingsPrimaryLayout with one Inertia page route per tab.
    Route::middleware('permission:' . Permissions::MANAGE_RATINGS)->group(function () {
        Route::redirect('/ratings', '/ratings/task-rating')->name('ratings.index');
        // Old bookmarked/typed URL for the pre-tab-refactor behavioral page.
        Route::redirect('/ratings/behavioral-rating', '/ratings/behavioral-form');

        Route::get('/ratings/task-rating', [TaskRatingController::class, 'index'])->name('ratings.task-rating.page');
        Route::get('/ratings/behavioral-form', [BehavioralEvaluationController::class, 'index'])->name('ratings.behavioral-form.page');
        // Behavioral Assessment Setup — Admin only. Nested permission means a
        // trainer (who holds MANAGE_RATINGS but not this) 403s here while
        // still reaching the Form/Task Rating routes above.
        Route::middleware('permission:' . Permissions::MANAGE_BEHAVIORAL_QUESTIONS)
            ->get('/ratings/behavioral-setup', [BehavioralQuestionController::class, 'index'])
            ->name('ratings.behavioral-setup.page');

        Route::prefix('ratings/task-rating')->name('ratings.task-rating.')->group(function () {
            Route::get('/task-options', [TaskRatingController::class, 'taskOptions'])->name('task-options');
            Route::get('/trainees', [TaskRatingController::class, 'trainees'])->name('trainees');
            Route::get('/entries', [TaskRatingController::class, 'forTask'])->name('index');
            Route::post('/entries', [TaskRatingController::class, 'store'])->name('store');
            Route::get('/{id}/history', [TaskRatingController::class, 'history'])->name('history');
        });
        Route::prefix('ratings/behavioral-rating')->name('ratings.behavioral-rating.')->group(function () {
            Route::get('/trainees', [BehavioralEvaluationController::class, 'trainees'])->name('trainees');
            Route::get('/questions', [BehavioralEvaluationController::class, 'activeQuestions'])->name('questions');
            Route::get('/evaluation', [BehavioralEvaluationController::class, 'forTrainee'])->name('evaluation');
            Route::post('/evaluation', [BehavioralEvaluationController::class, 'store'])->name('evaluation.store');
        });
        Route::middleware('permission:' . Permissions::MANAGE_BEHAVIORAL_QUESTIONS)
            ->group(function () {
                Route::crudModule('ratings/behavioral-questions', BehavioralQuestionController::class, 'ratings.behavioral-questions');
            });
    });

    // Evaluation module: Overview (analytics), Trainer Questionnaire and
    // Seminar Questionnaire question banks. Gated by `manage evaluation`,
    // matching the Ratings/Tasks module convention.
    Route::middleware('permission:' . Permissions::MANAGE_EVALUATION)->group(function () {
        Route::redirect('/evaluation', '/evaluation/overview')->name('evaluation.index');
        Route::get('/evaluation/overview', [EvaluationViewController::class, 'index'])->name('evaluation.overview.index');
        Route::get('/evaluation/overview/metrics', [EvaluationViewController::class, 'metrics'])->name('evaluation.overview.metrics');
        Route::get('/evaluation/overview/records/pagination-search', [EvaluationViewController::class, 'records'])->name('evaluation.overview.records');
        Route::patch('/evaluation/overview/records/{type}/{id}/archive', [EvaluationViewController::class, 'archiveRecord'])->name('evaluation.overview.records.archive');
        Route::delete('/evaluation/overview/records/{type}/{id}', [EvaluationViewController::class, 'destroyRecord'])->name('evaluation.overview.records.destroy');
        Route::get('/evaluation/overview/batch-progress', [EvaluationViewController::class, 'batchProgress'])->name('evaluation.overview.batch-progress');
        Route::get('/evaluation/overview/seminar-progress', [EvaluationViewController::class, 'seminarProgress'])->name('evaluation.overview.seminar-progress');
        Route::get('/evaluation/overview/reminders', [EvaluationViewController::class, 'reminders'])->name('evaluation.overview.reminders');
        Route::post('/evaluation/overview/reminders/notify', [EvaluationViewController::class, 'notifyReminders'])->name('evaluation.overview.reminders.notify');
        Route::get('/evaluation/trainer-questionnaire/categories', [EvaluationTrainerQuestionnaire::class, 'categories'])->name('evaluation.trainer-questionnaire.categories');
        Route::get('/evaluation/trainer-questionnaire/for-category', [EvaluationTrainerQuestionnaire::class, 'forCategory'])->name('evaluation.trainer-questionnaire.for-category');
        Route::crudModule('/evaluation/trainer-questionnaire', EvaluationTrainerQuestionnaire::class, 'evaluation.trainer-questionnaire');
        Route::get('/evaluation/seminar-questionnaire/categories', [EvaluationSeminarQuestionnaire::class, 'categories'])->name('evaluation.seminar-questionnaire.categories');
        Route::get('/evaluation/seminar-questionnaire/for-category', [EvaluationSeminarQuestionnaire::class, 'forCategory'])->name('evaluation.seminar-questionnaire.for-category');
        Route::crudModule('/evaluation/seminar-questionnaire', EvaluationSeminarQuestionnaire::class, 'evaluation.seminar-questionnaire');
    });
    Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('/payments/pagination-search', [PaymentController::class, 'paginationSearch'])->name('payments.pagination-search');
    Route::get('/payments/{id}', [PaymentController::class, 'show'])->name('payments.show');
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::middleware('permission:' . Permissions::MANAGE_SEMINARS)->group(function () {
        Route::redirect('/seminars', '/seminars/list-of-seminars')->name('seminars.index');
        Route::get('/seminars/list-of-seminars', [SeminarListController::class, 'index'])->name('seminars.list-of-seminars.index');
        Route::get('/seminars/participants', [SeminarParticipantsController::class, 'index'])->name('seminars.participants.index');
        Route::get('/seminars/email-notification', [SeminarEmailNotificationController::class, 'index'])->name('seminars.email-notification.index');
        Route::get('/seminars/lookup', [SeminarController::class, 'lookup'])->name('seminars.lookup');
    });
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // ==========================================
    // CERTIFICATES MODULE GROUP — Trainees / Seminar / Citations are distinct
    // routes sharing CertificatesPrimaryLayout, matching the settings pattern.
    // ==========================================
    Route::prefix('certificates')->name('certificates.')->group(function () {
        Route::get('/', fn() => redirect()->route('certificates.trainees.index'))->name('index');
        Route::get('/trainees', [TraineeCertificateController::class, 'index'])->name('trainees.index');
        Route::get('/trainees/pagination-search', [TraineeCertificateController::class, 'paginationSearch'])->name('trainees.pagination-search');
        Route::post('/trainees/{trainee}/issue', [TraineeCertificateController::class, 'issue'])->name('trainees.issue');

        Route::get('/seminar', [SeminarCertificateController::class, 'index'])->name('seminar.index');
        Route::get('/seminar/pagination-search', [SeminarCertificateController::class, 'paginationSearch'])->name('seminar.pagination-search');
        Route::post('/seminar/{participant}/issue', [SeminarCertificateController::class, 'issue'])->name('seminar.issue');
    });
    // Citations page (index/paginationSearch render the CSR shell + serve the
    // DataTableCardField feed) and Templates JSON API — both come free from
    // BaseController via crudModule, same as the settings sub-modules.
    Route::crudModule('/certificates/citations', CitationController::class, 'certificates.citations');
    Route::crudModule('/certificates/templates', CertificateTemplateController::class, 'certificates.templates');
    // Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');

    Route::crudModule('/announcements', AnnoucementController::class, 'announcements');
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

    // Developer-only global audit trail. Read-only: the index CSR shell plus the
    // DataTableField list feed. Gated to the `developer` role (auth runs first,
    // via the enclosing group + BaseController's own auth middleware).
    Route::middleware('role:developer')->group(function () {
        Route::get('/system-log', [SystemLogController::class, 'index'])->name('system-log.index');
        Route::get('/system-log/pagination-search', [SystemLogController::class, 'paginationSearch'])->name('system-log.pagination-search');
    });

    // Trainer-only placeholder module — role-gated, deliberately NOT reusing
    // the shared /tasks, /batches, /trainees, /schedule, /ratings,
    // /announcements routes above (trainer already holds those `manage *`
    // permissions via RoleSeeder, so route-level role gating keeps this
    // surface separate while the real trainer experience is built out).
    Route::middleware('role:trainer')->prefix('trainer')->name('trainer.')->group(function () {
        Route::get('/dashboard', [TrainerDashboardController::class, 'index'])->name('dashboard');
        // Dashboard widgets self-fetch client-side (see
        // resources/js/api-service-layer/trainer/dashboard.ts) rather than
        // via Inertia props — each endpoint is batch-scoped, JSON-only.
        Route::get('/dashboard/metrics', [TrainerDashboardController::class, 'metrics'])->name('dashboard.metrics');
        Route::get('/dashboard/upcoming-ends', [TrainerDashboardController::class, 'upcomingEnds'])->name('dashboard.upcoming-ends');
        Route::get('/dashboard/calendar-events', [TrainerDashboardController::class, 'calendarEvents'])->name('dashboard.calendar-events');
        Route::get('/dashboard/on-leave', [TrainerDashboardController::class, 'onLeave'])->name('dashboard.on-leave');
        Route::get('/dashboard/ongoing-tasks', [TrainerDashboardController::class, 'ongoingTasks'])->name('dashboard.ongoing-tasks');
        Route::get('/dashboard/announcements', [TrainerDashboardController::class, 'announcements'])->name('dashboard.announcements');
        Route::get('/dashboard/document-compliance', [TrainerDashboardController::class, 'documentCompliance'])->name('dashboard.document-compliance');
        // Read-only, batch-scoped (TrainerBatchesController::newQuery() /
        // BatchViewController::assertBatchAssigned()) — no store/update/archive/
        // destroy for this role.
        Route::get('/batches', [TrainerBatchesController::class, 'index'])->name('batches');
        Route::get('/batches/pagination-search', [TrainerBatchesController::class, 'paginationSearch'])->name('batches.pagination-search');
        // Inherited from BaseController — status-aware paginated options,
        // scoped by the same newQuery() override as the list above. Backs
        // the batch picker on the Task Rating page.
        Route::get('/batches/lookup', [TrainerBatchesController::class, 'lookup'])->name('batches.lookup');
        Route::get('/batches/{batch}/trainees/pagination-search', [TrainerBatchTraineesController::class, 'paginationSearch'])->name('batches.trainees.pagination-search');
        Route::get('/batches/{id}', [TrainerBatchViewController::class, 'trainees'])->name('batches.show');
        // Read-only trainee list + Personal Info/Academic Info/Documents/
        // Learning Outcomes tabs, all scoped/guarded by ScopesToAssignedBatches.
        // No Ratings/Biometrics/Certificate/Payment Details (out of Phase-1 scope).
        Route::get('/trainees', [TrainerTraineesController::class, 'index'])->name('trainees');
        Route::get('/trainees/pagination-search', [TrainerTraineesController::class, 'paginationSearch'])->name('trainees.pagination-search');
        // Inherited from BaseController, scoped by the same newQuery() override
        // — backs the trainee filter dropdown on the Daily Task Sheet.
        Route::get('/trainees/lookup', [TrainerTraineesController::class, 'lookup'])->name('trainees.lookup');
        Route::get('/trainees/{id}', [TrainerTraineesViewController::class, 'personalInformationTab'])->name('trainees.show');
        Route::get('/trainees/{id}/academic-info', [TrainerTraineesViewController::class, 'academicInfoTab'])->name('trainees.academic-info');
        Route::get('/trainees/{id}/documents', [TrainerTraineesViewController::class, 'documents'])->name('trainees.documents');
        Route::get('/trainees/{id}/learning-outcomes', [TrainerTraineesViewController::class, 'learningOutcomes'])->name('trainees.learning-outcomes');
        Route::patch('/trainees/{id}/learning-outcomes/{outcomeId}', [TrainerTraineesViewController::class, 'updateLearningOutcomeStatus'])->name('trainees.learning-outcomes.update');
        Route::post('/trainees/{traineeId}/documents', [TrainerTraineeDocumentsController::class, 'uploadDocument'])->name('trainees.documents.upload');
        Route::delete('/trainees/{traineeId}/documents/{documentId}', [TrainerTraineeDocumentsController::class, 'deleteDocument'])->name('trainees.documents.delete');
        Route::get('/tasks', [TrainerTasksController::class, 'index'])->name('tasks');
        Route::get('/schedule', [TrainerScheduleController::class, 'index'])->name('schedule');
        // Full CRUD JSON API (batch-scoped by AnnouncementsController::newQuery()/
        // storeRules()) — replaces the old index-only placeholder route.
        Route::crudModule('/announcements', TrainerAnnouncementsController::class, 'announcements');
        Route::get('/announcements/batch-options', [TrainerAnnouncementsController::class, 'batchOptions'])->name('announcements.batch-options');
        Route::get('/ratings', [TrainerRatingsController::class, 'index'])->name('ratings');
        // Read-only "who's on leave" feed — reuses the shared LeaveRequestController
        // JSON API (LeaveRequestPolicy::viewAny() grants trainers read access);
        // no submit/approve UI, no email per the trainer-visibility requirement.
        Route::get('/leave', [TrainerLeaveController::class, 'index'])->name('leave');
        // Read-only Evaluation Overview — trainee-submitted app_trainer_evaluations
        // rows, scoped to the trainer's assigned batches by EvaluationsController's
        // newQuery()/metrics() overrides (ScopesToAssignedBatches).
        Route::prefix('evaluation')->name('evaluation.')->group(function () {
            Route::get('/', [TrainerEvaluationsController::class, 'index'])->name('index');
            Route::get('/pagination-search', [TrainerEvaluationsController::class, 'paginationSearch'])->name('pagination-search');
            Route::get('/metrics', [TrainerEvaluationsController::class, 'metrics'])->name('metrics');
        });
    });

    // Trainee-only placeholder module — same rationale as above.
    Route::middleware('role:trainee')->prefix('trainee')->name('trainee.')->group(function () {
        Route::get('/dashboard', [TraineeDashboardController::class, 'index'])->name('dashboard');
        Route::post('/announcements/{id}/read', [TraineeDashboardController::class, 'markAnnouncementRead'])->name('announcements.read');
        Route::middleware('permission:' . Permissions::MANAGE_OWN_TASKS)
            ->prefix('tasks')->name('tasks.')->group(function () {
                Route::get('/', [TraineeTasksController::class, 'index'])->name('index');
                Route::get('/daily-task', [TraineeTasksController::class, 'dailyTask'])->name('daily-task');
                Route::get('/pagination-search', [TraineeTasksController::class, 'paginationSearch'])->name('pagination-search');
                Route::get('/aggregates', [TraineeTasksController::class, 'aggregates'])->name('aggregates');
                Route::get('/trainers', [TraineeTasksController::class, 'trainers'])->name('trainers');
                Route::patch('/{id}/run', [TraineeTasksController::class, 'runAction'])->name('run');
                Route::patch('/{id}/stop', [TraineeTasksController::class, 'stopAction'])->name('stop');
                Route::patch('/{id}/complete', [TraineeTasksController::class, 'completeAction'])->name('complete');
                Route::patch('/{id}/remarks', [TraineeTasksController::class, 'updateRemarks'])->name('remarks');
            });
        Route::get('/announcements', [TraineeAnnouncementsController::class, 'index'])->name('announcements');
        Route::get('/leave', [TraineeLeaveController::class, 'index'])->name('leave');
        Route::get('/biometrics', [TraineeBiometricsController::class, 'index'])->name('biometrics');
        Route::middleware('permission:' . Permissions::MANAGE_OWN_EVALUATION)
            ->prefix('evaluations')->name('evaluations.')->group(function () {
                Route::get('/', [TraineeEvaluationsController::class, 'index'])->name('index');
                Route::get('/gateway', [TraineeEvaluationsController::class, 'gateway'])->name('gateway');
                Route::get('/questions', [TraineeEvaluationsController::class, 'activeQuestions'])->name('questions');
                Route::post('/', [TraineeEvaluationsController::class, 'store'])->name('store');
            });
        Route::prefix('payments')->name('payments.')->group(function () {
            Route::get('/', [TraineeSelfPaymentsController::class, 'index'])->name('index');
            Route::get('/pagination-search', [TraineeSelfPaymentsController::class, 'paginationSearch'])->name('pagination-search');
        });
        Route::prefix('ratings')->name('ratings.')->group(function () {
            Route::get('/', [TraineeRatingsController::class, 'index'])->name('index');
            Route::get('/pagination-search', [TraineeRatingsController::class, 'paginationSearch'])->name('pagination-search');
            Route::get('/trainers', [TraineeRatingsController::class, 'trainers'])->name('trainers');
            Route::get('/metrics', [TraineeRatingsController::class, 'metrics'])->name('metrics');
        });
        Route::middleware('permission:' . Permissions::MANAGE_OWN_MY_INFO)
            ->prefix('my-info')->name('my-info.')->group(function () {
                Route::get('/', [TraineeMyInfoController::class, 'index'])->name('index');
                Route::post('/documents', [TraineeMyInfoController::class, 'uploadDocument'])->name('documents.store');
                Route::delete('/documents/{document}', [TraineeMyInfoController::class, 'deleteDocument'])->name('documents.destroy');
            });
    });
});
