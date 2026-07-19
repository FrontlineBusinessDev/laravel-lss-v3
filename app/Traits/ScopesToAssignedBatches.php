<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

/**
 * Shared batch-scoping for every trainer-facing controller. A trainer's
 * visibility across Announcements, Batches, Trainees, Leave, Ratings, and
 * Tasks is always constrained to the batches they're assigned to via the
 * app_batch_trainer pivot (Batches::trainers() / User::assignedBatches()).
 */
trait ScopesToAssignedBatches
{
    /**
     * @return list<int>
     */
    protected function assignedBatchIds(): array
    {
        return auth()->user()
            ->assignedBatches()
            ->pluck('app_batches.id')
            ->all();
    }

    protected function scopeToAssignedBatches(Builder $query, string $batchColumn = 'batch_id'): Builder
    {
        return $query->whereIn($batchColumn, $this->assignedBatchIds());
    }

    protected function assertBatchAssigned(int|string $batchId): void
    {
        abort_unless(in_array((int) $batchId, $this->assignedBatchIds(), true), 403);
    }
}
