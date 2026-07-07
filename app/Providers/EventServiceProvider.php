<?php

namespace App\Providers;

use App\Listeners\PreventInactiveLogin;
use Illuminate\Auth\Events\Attempting;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The event to listener mappings for the application.
     *
     * @var array<class-string, array<int, class-string>>
     */
    protected $listen = [
        Attempting::class => [
            PreventInactiveLogin::class,
        ],
    ];
}
