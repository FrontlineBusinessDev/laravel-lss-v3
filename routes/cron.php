<?php

use App\Http\Controllers\CronController;
use Illuminate\Support\Facades\Route;

// Registered in bootstrap/app.php OUTSIDE the `web` group — no session, CSRF or
// Inertia middleware. Secured by a shared secret in the URL (config services.cron.secret).
Route::get('/cron/{token}', CronController::class)->name('cron.run');
