<?php

namespace App\Providers;

use App\Models\Batches;
use App\Models\Trainees;
use App\Observers\BatchStatusObserver;
use App\Observers\TraineeObserver;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Throwable;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->logMailQueueOutcomes();
        /** LISTENT TO PAYMENT */
        Trainees::observe(TraineeObserver::class);
        Batches::observe(BatchStatusObserver::class);
        /**
         * REUSABLE API
         */
        Route::macro('crudModule', function (string $prefix, string $controller, string $name) {
            Route::prefix($prefix)->name("{$name}.")->group(function () use ($controller) {
                Route::get('/', [$controller, 'index'])->name('index');
                Route::get('/pagination-search', [$controller, 'paginationSearch'])->name('pagination-search');
                Route::get('/search-active', [$controller, 'searchActive'])->name('search-active');
                Route::get('/lookup', [$controller, 'lookup'])->name('lookup');
                Route::get('/{id}/in-use', [$controller, 'inUse'])->name('in-use');
                Route::post('/', [$controller, 'store'])->name('store');
                Route::post('/{id}', [$controller, 'update'])->name('update'); // post is needed for files uploading
                Route::patch('/{id}/archive', [$controller, 'archive'])->name('archive');
                Route::patch('/{id}/restore', [$controller, 'restore'])->name('restore');
                Route::delete('/{id}', [$controller, 'destroy'])->name('destroy');
            });
        });
        /**
         * THIS ENFORCES THE HTTPS CONNECTION WITH PRODUCTION BUILD
         */
        if (app()->environment('production') || app()->environment('staging')) {
            URL::forceScheme('https');
        }

        /**
         * DEV-ONLY STRICTNESS: surfaces lazy-loading, missing-attribute, and
         * silently-discarded-attribute bugs as exceptions instead of letting
         * them fail silently in staging/production.
         */
        if (app()->environment(['local', 'development'])) {
            Model::shouldBeStrict();
        }
    }

    /**
     * Queue workers run as their own process (their own Coolify service, in
     * production) with no visibility into whether a queued Mail::queue(...)
     * call actually reached the SMTP server or died silently. Log a single
     * clear line per outcome so "did the email send?" is answerable from the
     * worker's own logs instead of guessing.
     */
    protected function logMailQueueOutcomes(): void
    {
        Queue::after(function (JobProcessed $event) {
            $description = $this->describeMailJob($event->job->payload());
            if ($description !== null) {
                Log::info("Queue mail sent: {$description}");
            }
        });

        Queue::failing(function (JobFailed $event) {
            $description = $this->describeMailJob($event->job->payload());
            if ($description !== null) {
                $reason = $event->exception?->getMessage() ?? 'unknown error';
                Log::error("Queue mail FAILED: {$description} — {$reason}");
            }
        });
    }

    /**
     * Returns "MailableClass to email@example.com" for a queued mail job's
     * payload, or null if this job isn't a queued Mailable at all.
     */
    protected function describeMailJob(array $payload): ?string
    {
        if (($payload['data']['commandName'] ?? null) !== \Illuminate\Mail\SendQueuedMailable::class) {
            return null;
        }

        try {
            $command = unserialize($payload['data']['command']);
            $mailable = $command->mailable;
            $to = collect($mailable->to ?? [])
                ->pluck('address')
                ->implode(', ');

            return sprintf('%s to %s', $mailable::class, $to ?: 'unknown recipient');
        } catch (Throwable) {
            return 'unrecognized mail job';
        }
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(
            fn(): ?Password => app()->isProduction()
                ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
                : null,
        );
    }
}
