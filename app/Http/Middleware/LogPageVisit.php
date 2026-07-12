<?php

namespace App\Http\Middleware;

use App\Support\ActivityLogger;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Records a "visit" audit entry for authenticated page views. Fires only for GET
 * requests that resolve to an Inertia page (the request/response carries the
 * X-Inertia header, or is the initial HTML document) so JSON CRUD/lookup
 * endpoints and asset requests are ignored. Guest routes are skipped (no user),
 * and the /system-log page is skipped so browsing the audit trail doesn't spam
 * it. Controller-agnostic, so it covers every module without touching
 * BaseController.
 */
class LogPageVisit
{
    /** Route-name fragments whose GET endpoints are data, not page views. */
    private const SKIP_SEGMENTS = [
        'pagination-search', 'search-active', 'lookup', 'in-use', 'qr',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldLog($request, $response)) {
            ActivityLogger::log('visit', null, [
                'url' => $request->fullUrl(),
                'route' => $request->route()?->getName(),
            ]);
        }

        return $response;
    }

    private function shouldLog(Request $request, Response $response): bool
    {
        if ($request->method() !== 'GET' || $request->user() === null) {
            return false;
        }

        if ($request->routeIs('system-log.*') || $this->isDataEndpoint($request)) {
            return false;
        }

        // Inertia page response (SPA visit) or the initial full HTML document.
        return $request->hasHeader('X-Inertia')
            || $response->headers->has('X-Inertia')
            || str_contains((string) $response->headers->get('Content-Type'), 'text/html');
    }

    private function isDataEndpoint(Request $request): bool
    {
        $name = $request->route()?->getName() ?? '';
        foreach (self::SKIP_SEGMENTS as $segment) {
            if (str_contains($name, $segment)) {
                return true;
            }
        }

        return false;
    }
}
