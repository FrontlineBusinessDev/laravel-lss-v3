<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\Controller;
use App\Http\Responses\InertiaPageResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

/** CSR shell for Settings > Import. Actual import endpoints live in Settings\Import\*ImportController — see routes/web.php. */
class ImportController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware(['auth', 'role:admin|developer', 'throttle:60,1']),
        ];
    }

    public function index()
    {
        return InertiaPageResponse::csr('developer/settings/import/index');
    }
}
