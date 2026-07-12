<?php

use App\Providers\ActivityLogServiceProvider;
use App\Providers\AppServiceProvider;
use App\Providers\EventServiceProvider;
use App\Providers\FortifyServiceProvider;
use App\Providers\InertiaServiceProvider;

return [
    ActivityLogServiceProvider::class,
    AppServiceProvider::class,
    EventServiceProvider::class,
    FortifyServiceProvider::class,
    InertiaServiceProvider::class
];
