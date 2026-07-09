<?php

namespace App\Http\Controllers\Lss;

use App\Http\Controllers\Controller;
use App\Http\Responses\InertiaPageResponse;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller implements HasMiddleware
{
    /**
     * Renders the settings shell. Developers (who can manage roles) get the
     * variant that exposes the Roles sub-tab; everyone else gets the admin
     * variant that shows Users only. Both reuse the same shared components.
     */
    // public function index(): Response
    // {
    //     /** @disregard P1013 */ // this disregard the error below but it works 
    //     $component = auth()->user()?->can(Permissions::MANAGE_ROLES)
    //         ? 'shell/developer/settings/index'
    //         : 'shell/admin/settings/index';

    //     return Inertia::render($component, [
    //         'permissionModules' => Permissions::modules(),
    //     ])->asCsr();
    // }
    public static function middleware(): array
    {
        return [
            // FOR AUTHENTICATED USERS AND RATE LIMIT
            new Middleware(['auth', 'throttle:60,1']),
            // FOR ACCESSING THE PAGE
            new Middleware('permission:' . Permissions::MANAGE_SETTINGS, only: ['index']),
        ];
        // Enforce the specific permission using your constant

    }
    /**
     * LOAD CSR PAGE
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->can('manage users')) {
            return redirect()->route('settings.users.index'); // or '/settings/users'
        }
        if ($user->can('manage settings partner schoolss')) {
            return redirect('/settings/partner-schools');
        }

        if ($user->can('manage settings academics')) {
            return redirect('/settings/academic');
        }
        // Default catch-all if they have absolutely no business being here
        abort(404);
        // Use CSR for authenticated dashboard
        return InertiaPageResponse::csr('settings/index');
    }
}
