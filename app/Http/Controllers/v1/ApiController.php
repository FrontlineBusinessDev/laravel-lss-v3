<?php

namespace App\Http\Controllers\v1;

use App\Http\Controllers\v1\Concerns\JsonResponds;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

/**
 * Lightweight base for authenticated JSON/Inertia endpoints that don't need
 * BaseController's full CRUD engine (storeRules/paginationSearch/archive/...).
 * Bundles the same auth+throttle middleware, authorize(), and sendResponse()/
 * sendError() envelope so these controllers stop hand-rolling them — see
 * docs/refactor-audit.md's "controllers extend nothing" item.
 */
abstract class ApiController extends Controller implements HasMiddleware
{
    use AuthorizesRequests, JsonResponds;

    /** THIS IS FOR AUTHENTICATED USERS ONLY AND RATE LIMIT OF PER USER */
    public static function middleware(): array
    {
        return [new Middleware(['auth', 'throttle:120,1'])];
    }
}
