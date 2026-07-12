<?php

use App\Http\Controllers\CronController;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Behind the FrankenPHP/Octane (and platform) proxy, trust forwarded
        // headers so X-Forwarded-Proto is honored and generated URLs — notably
        // the og:image — resolve as HTTPS instead of http://, which social
        // scrapers reject (a key cause of the "image disappears in Messenger").
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            \App\Http\Middleware\EnsureUserIsActive::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            // Audit-trail "visit" logging. Self-guards on an authenticated user
            // and an Inertia/HTML page response, so it no-ops on guest routes
            // and JSON data endpoints (see LogPageVisit).
            \App\Http\Middleware\LogPageVisit::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->alias([
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn(Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e) {
            /** @disregard P1013 */ // this disregard the error below but it works
            $user = auth()?->user() ?? [];
            return inertia('pages-errors/429', [
                'auth' => ['user' => $user ? $user->toInertiaPayload() : null],
                'title' => 'Too Many Requests',
                'message' => 'You have exceeded your allowed rate limit. Please try again later.'
            ])->toResponse(request())->setStatusCode(429);
        });
    })->withSchedule(function () {
        // Call your controller directly every minute (or change to your preferred frequency)
        Schedule::call(new CronController)->everyMinute();
    })->create();
