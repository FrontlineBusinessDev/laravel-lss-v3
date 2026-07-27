<?php

namespace App\Http\Controllers\v1\Trainer\Batches;

use App\Http\Controllers\v1\BaseController;
use App\Http\Responses\InertiaPageResponse;
use App\Models\Batches;
use App\Traits\ScopesToAssignedBatches;

/**
 * Trainer-facing batch detail (Trainees tab only — no Activity log,
 * Financials, or Trainers tabs; those stay admin-only). Every entry point
 * asserts the batch is one of the trainer's assigned batches before
 * rendering, closing the cross-batch leak that a coarse `manage batches`
 * permission check alone would allow.
 */
class BatchViewController extends BaseController
{
    use ScopesToAssignedBatches;

    protected string $model = Batches::class;

    /** Trainees tab — the trainer's batch landing page (GET /trainer/batches/{id}). */
    public function trainees(int|string $id): mixed
    {
        $this->assertBatchAssigned($id);

        $batch = Batches::query()
            ->with([
                'academicIndustry:id,name',
                'academicProgram:id,name',
            ])
            ->withCount('trainees')
            ->findOrFail($id);

        /** @disregard P1013 */
        $user = auth()->user();

        return InertiaPageResponse::csr('trainer/batches/show/trainees', [
            'user' => $user,
            'record' => $batch,
        ]);
    }
}
