<?php

namespace App\Http\Controllers\v1\Developer;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * External-cron entry point.
 *
 * A free HTTP cron service (e.g. cron-job.org) hits GET /cron/{token} once a
 * minute; this runs Laravel's scheduler, which in turn dispatches whatever is
 * registered in bootstrap/app.php's withSchedule() closure. The route is
 * stateless (no session/CSRF) so hammering it every minute never bloats the
 * DB session table.
 */
class CronController extends Controller
{
    public function __invoke(string $token): Response
    {
        $secret = config('services.cron.secret');

        // 404 (not 403) on any mismatch so the endpoint's existence isn't
        // confirmable by scanners. Also disabled entirely when no secret is set.
        abort_unless(
            is_string($secret) && $secret !== '' && hash_equals($secret, $token),
            404,
        );

        try {
            Artisan::call('schedule:run');
        } catch (Throwable $e) {
            Log::error('External cron schedule:run failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }

        return response('OK', 200)->header('Content-Type', 'text/plain');
    }
}
