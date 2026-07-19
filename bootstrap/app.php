<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schedule;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
        then: function () {
            // routes/cron.php was previously never loaded at all (no web/api
            // param covers it), so GET /cron/{token} 404'd unconditionally —
            // registered here, deliberately outside the `web` middleware
            // group, so it stays session/CSRF-free for external cron pingers.
            Route::group([], __DIR__ . '/../routes/cron.php');
        },
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
        // Capture real application errors to the System Log (app_loggers) with
        // actor + stack trace. Skip HTTP-status exceptions (404/429/403/etc.)
        // and validation failures — those are expected control flow, not bugs,
        // and would otherwise flood the log with every broken link or bad form.
        $exceptions->report(function (\Throwable $e) {
            if ($e instanceof \Symfony\Component\HttpKernel\Exception\HttpExceptionInterface
                || $e instanceof \Illuminate\Validation\ValidationException
                || $e instanceof \Illuminate\Auth\AuthenticationException
                || $e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                return;
            }
            \App\Support\ActivityLogger::logError($e);
        });
        // 429 - Too Many Requests
        $exceptions->render(function (\Illuminate\Http\Exceptions\ThrottleRequestsException $e) {
            /** @disregard P1013 */ // this disregard the error below but it works
            $user = auth()?->user() ?? [];
            return inertia('pages-errors/429', [
                'auth' => ['user' => $user ? $user->toInertiaPayload() : null],
                'title' => 'Too Many Requests',
                'message' => 'You have exceeded your allowed rate limit. Please try again later.'
            ])->toResponse(request())->setStatusCode(429);
        });
        // 404 - Page Not Found
        $exceptions->render(function (\Symfony\Component\HttpKernel\Exception\NotFoundHttpException $e) {
            /** @disregard P1013 */
            $user = auth()?->user() ?? null;
            return inertia('pages-errors/404', [
                'auth' => ['user' => $user ? $user->toInertiaPayload() : null],
                'title' => 'Page Not Found',
                'message' => 'The page you are looking for does not exist or has been moved.'
            ])->toResponse(request())->setStatusCode(404);
        });
    })->withSchedule(function () {
        // Native cron entry point (`* * * * * php artisan schedule:run`). If the
        // host has no real crontab access, GET /cron/{token} (routes/cron.php,
        // CronController) triggers the same schedule:run externally instead —
        // do NOT also schedule CronController here, or a schedule:run triggered
        // via that route would recursively re-invoke schedule:run on every tick.
        Schedule::command('announcements:dispatch-scheduled')->everyMinute();
    })->create();
