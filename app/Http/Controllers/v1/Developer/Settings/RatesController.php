<?php

namespace App\Http\Controllers\v1\Developer\Settings;

use App\Http\Controllers\v1\BaseController;
use App\Http\Responses\InertiaPageResponse;
use App\Models\Rate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RatesController extends BaseController
{
    protected string $model = Rate::class;
    protected string $view = 'developer/settings/rates/index';

    /** Not a list — just the two fixed setup rows (f2f/online), keyed for the settings form. */
    public function index(Request $request): mixed
    {
        $rates = Rate::all()->keyBy('setup');
        /** @disregard P1013 */
        $user = $request->user();
        return InertiaPageResponse::csr($this->view, [
            'user' => $user,
            'rates' => [
                'f2f' => $rates->get('f2f')?->rate_per_hour ?? '0.00',
                'online' => $rates->get('online')?->rate_per_hour ?? '0.00',
            ],
        ]);
    }

    public function updateRates(Request $request): JsonResponse
    {
        $this->authorize('update', Rate::class);

        $validated = $request->validate([
            'f2f' => ['required', 'numeric', 'min:0'],
            'online' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated) {
            Rate::updateOrCreate(['setup' => 'f2f'], ['rate_per_hour' => $validated['f2f']]);
            Rate::updateOrCreate(['setup' => 'online'], ['rate_per_hour' => $validated['online']]);
        });

        return $this->sendResponse($validated, 'Rates updated successfully.');
    }
}
