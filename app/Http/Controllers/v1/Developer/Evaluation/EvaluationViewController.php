<?php

namespace App\Http\Controllers\v1\Developer\Evaluation;

use App\Http\Controllers\v1\Controller;
use App\Http\Responses\InertiaPageResponse;
use App\Support\Permissions;
use Illuminate\Http\Request;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class EvaluationViewController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            // FOR AUTHENTICATED USERS AND RATE LIMIT
            new Middleware(['auth', 'throttle:60,1']),
            // FOR ACCESSING THE PAGE
            new Middleware('permission:' . Permissions::MANAGE_EVALUATION, only: ['index']),
        ];
        // Enforce the specific permission using your constant

    }
    /**
     * LOAD CSR PAGE
     */
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->can(Permissions::MANAGE_EVALUATION)) {
            return redirect()->route('evaluation.index'); // or '/evaluation/index'
        }
        if ($user->can(Permissions::MANAGE_EVALUATION)) {
            return redirect('/evaluation/trainer-questionnaire');
        }
        if ($user->can(Permissions::MANAGE_EVALUATION)) {
            return redirect('/evaluation/seminar-questionnaire');
        }
        // Default catch-all if they have absolutely no business being here
        abort(404);
        // Use CSR for authenticated dashboard
        return InertiaPageResponse::csr('evaluation.index');
    }
}
