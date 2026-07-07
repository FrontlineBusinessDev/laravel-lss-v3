<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

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
                Route::put('/{id}', [$controller, 'update'])->name('update');
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
            fn (): ?Password => app()->isProduction()
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
