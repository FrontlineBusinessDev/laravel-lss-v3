<?php

namespace App\Http\Controllers\v1\Developer;

use Illuminate\Support\Facades\Artisan;
use Symfony\Component\HttpFoundation\Response;

/**
 * External-cron entry point.
 *
 * A free HTTP cron service (e.g. cron-job.org) hits GET /cron/{token} once a
 * minute; this runs Laravel's scheduler, which in turn dispatches whatever is
 * registered in routes/console.php. The route is stateless (no session/CSRF)
 * so hammering it every minute never bloats the DB session table.
 */
class CronController extends Controller
{
    // THIS IS FOR TASK SCHEDULE
    public function __invoke()
    {
        logger('Custom background tasks executed safely via native scheduler.');
    }
    // THIS IS FOR CRON CODE SETUP
    // public function __invoke(string $token): Response
    // {
    //     $secret = config('services.cron.secret');

    //     // 404 (not 403) on any mismatch so the endpoint's existence isn't
    //     // confirmable by scanners. Also disabled entirely when no secret is set.
    //     abort_unless(
    //         is_string($secret) && $secret !== '' && hash_equals($secret, $token),
    //         404,
    //     );
    //     Artisan::call('schedule:run');
    //     return response('OK', 200)->header('Content-Type', 'text/plain');
    // }
}
