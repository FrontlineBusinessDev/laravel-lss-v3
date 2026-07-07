<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Inertia\Response as InertiaResponse;

/**
 * @property \Illuminate\View\View $view
 */
class InertiaServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Register a macro for CSR-only responses
        if (! InertiaResponse::hasMacro('asCsr')) {
            InertiaResponse::macro('asCsr', function () {
                /** @var InertiaResponse $this */
                $this->view = 'app-csr';
                return $this;
            });
        }
        // Register a macro for SSR responses
        if (! InertiaResponse::hasMacro('asSsr')) {
            InertiaResponse::macro('asSsr', function () {
                /** @var InertiaResponse $this */
                $this->view = 'app-ssr';
                return $this;
            });
        }
    }
}
