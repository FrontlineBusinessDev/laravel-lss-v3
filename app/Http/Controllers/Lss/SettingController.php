<?php

namespace App\Http\Controllers\Lss;

use App\Http\Controllers\Controller;
use App\Support\Permissions;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Renders the settings shell. Developers (who can manage roles) get the
     * variant that exposes the Roles sub-tab; everyone else gets the admin
     * variant that shows Users only. Both reuse the same shared components.
     */
    public function index(): Response
    {
        /** @disregard P1013 */ // this disregard the error below but it works 
        $component = auth()->user()?->can(Permissions::MANAGE_ROLES)
            ? 'shell/developer/settings/index'
            : 'shell/admin/settings/index';

        return Inertia::render($component, [
            'permissionModules' => Permissions::modules(),
        ])->asCsr();
    }
}
