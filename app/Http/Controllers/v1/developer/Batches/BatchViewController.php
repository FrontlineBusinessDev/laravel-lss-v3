<?php

namespace App\Http\Controllers\v1\developer\Batches;

use App\Http\Controllers\v1\developer\BaseController;
use App\Http\Responses\InertiaPageResponse;
use App\Models\Batches;

/**
 * Batch detail view. Each tab (Trainees / Activity log / Financials) is a real
 * Inertia route with its own handler, mirroring the settings module pattern.
 * Every handler renders through a shared detail layout that receives the same
 * `record` prop, so the header/cards/registration link stay consistent while
 * only the tab body differs.
 */
class BatchViewController extends BaseController
{
    protected string $model = Batches::class;

    /** Trainees tab — the default batch landing page (GET /batches/{id}). */
    public function trainees(int|string $id): mixed
    {
        return $this->renderTab('batches/show/trainees', $id);
    }

    /** Activity log tab (GET /batches/{id}/activity-log). */
    public function activityLog(int|string $id): mixed
    {
        return $this->renderTab('batches/show/activity-log', $id);
    }

    /** Financials tab (GET /batches/{id}/financial). */
    public function financial(int|string $id): mixed
    {
        return $this->renderTab('batches/show/financial', $id);
    }

    /**
     * Load the batch with its display relations + trainee count and hand the
     * common props to the requested tab component.
     */
    private function renderTab(string $view, int|string $id): mixed
    {
        $batch = Batches::query()
            ->with([
                'academicIndustry:id,name',
                'academicLevel:id,name',
                'academicProgram:id,name',
            ])
            ->withCount('trainees')
            ->findOrFail($id);

        $this->authorize('view', $batch);

        /** @disregard P1013 */
        $user = auth()->user();

        return InertiaPageResponse::csr($view, [
            'user' => $user,
            'record' => $batch,
            'registrationUrl' => route('public.register', $batch->public_registration_url_id),
        ]);
    }
}
